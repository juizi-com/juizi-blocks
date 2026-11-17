"""The Data visualisation block's data, read on the server.

- ``GraphBlockSerializer``: whenever a page is sent (to visitors, to Volto's
  server render, to the editor), a block linked to a CSV file gets the
  file's current rows as ``dataTable``. Nobody refreshes anything: replace
  the file and the next page view shows the new data. Parsed tables are
  cached per file version (``table.cache``), so a page view costs a lookup,
  not a file read.
- ``GraphBlockDeserializer``: ``dataTable`` is never saved with the page
  (it comes back from the editor with the block); pasted data is capped.
- ``GraphBlockLinksRetriever``: the linked file counts as a link from the
  page, so Plone warns before the file is deleted, and the page knows which
  files it uses (``subscribers.purge_pages_using_file``).
"""

from AccessControl import getSecurityManager
from AccessControl.PermissionRole import rolesForPermissionOn
from juizi.blocks.graph import table
from plone.app.uuid.utils import uuidToObject
from plone.restapi.interfaces import IBlockFieldDeserializationTransformer
from plone.restapi.interfaces import IBlockFieldLinkIntegrityRetriever
from plone.restapi.interfaces import IBlockFieldSerializationTransformer
from plone.uuid.interfaces import IUUID
from Products.CMFCore.utils import getToolByName
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface

import re


BLOCK_TYPE = "graphBlock"
DATA_KEY = "dataTable"
UID = re.compile(r"resolveuid/([0-9a-f]{32})")
DOWNLOAD = re.compile(r"/@@(download|display-file)/.*$")


def file_reference(value) -> str:
    """The link picker's value (``[{"@id": ...}]``), a single object or a
    plain string: the link as text, '' when there is none."""
    item = value[0] if isinstance(value, list) and value else value
    if isinstance(item, dict):
        item = item.get("@id")
    return item if isinstance(item, str) else ""


def find_file(context, reference: str):
    """The linked content item, without checking permissions (callers do)."""
    if not reference:
        return None
    match = UID.search(reference)
    if match:
        return uuidToObject(match.group(1), unrestricted=True)
    portal_url = getToolByName(context, "portal_url")
    portal = portal_url.getPortalObject()
    path = DOWNLOAD.sub("", reference.split("?")[0])
    base = portal_url()
    if path.startswith(base):
        path = path[len(base) :]
    elif re.match(r"^https?://", path):
        return None  # another site
    try:
        return portal.unrestrictedTraverse(path.strip("/"), None)
    except Exception:
        return None


def is_public(obj) -> bool:
    return "Anonymous" in rolesForPermissionOn("View", obj)


def load_file_table(context, reference: str, delimiter=None, view=None) -> dict:
    """The table in a linked file, for the current user."""
    obj = find_file(context, reference)
    blob = getattr(obj, "file", None) if obj is not None else None
    if blob is None:
        return {"columns": [], "rows": [], "total": 0, "error": "missing"}
    if not getSecurityManager().checkPermission("View", obj):
        # Nothing about the file is shown to someone who can't see it.
        return {"columns": [], "rows": [], "total": 0, "error": "private"}
    key = (
        IUUID(obj, None),
        getattr(obj, "_p_serial", None),
        getattr(blob, "_p_serial", None),
        delimiter or table.AUTO,
        table.view_kind(view),
    )
    result = table.cache.get(key)
    if result is None:
        if (blob.getSize() or 0) > table.MAX_FILE_BYTES:
            result = {"columns": [], "rows": [], "total": 0, "error": "too-big"}
        else:
            result = table.from_bytes(blob.data, delimiter, view)
        table.cache.set(key, result)
    return dict(result, fileIsPublic=is_public(obj), fileUrl=obj.absolute_url())


@implementer(IBlockFieldSerializationTransformer)
@adapter(Interface, Interface)
class GraphBlockSerializer:
    # Before plone.restapi's resolveuid transformer (order 1), so the stored
    # resolveuid link is read directly; absolute links work too.
    order = 0
    block_type = BLOCK_TYPE

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, block):
        block = dict(block)
        block.pop(DATA_KEY, None)
        if block.get("dataSource") == "paste":
            return block
        reference = file_reference(block.get("csvFile"))
        if not reference:
            return block
        delimiter = block.get("delimiter") or table.AUTO
        view = block.get("chartType")
        data = load_file_table(self.context, reference, delimiter, view)
        data["source"] = {
            "file": reference,
            "delimiter": delimiter,
            "kind": table.view_kind(view),
        }
        block[DATA_KEY] = data
        return block


@implementer(IBlockFieldDeserializationTransformer)
@adapter(Interface, Interface)
class GraphBlockDeserializer:
    order = 100
    block_type = BLOCK_TYPE

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, block):
        block = dict(block)
        block.pop(DATA_KEY, None)
        pasted = block.get("pastedTable")
        if isinstance(pasted, dict):
            columns = [str(c) for c in (pasted.get("columns") or [])][:50]
            rows = [
                [str(cell) for cell in row][: len(columns)]
                for row in (pasted.get("rows") or [])[: table.MAX_ROWS]
                if isinstance(row, list)
            ]
            block["pastedTable"] = {"columns": columns, "rows": rows}
        return block


@implementer(IBlockFieldLinkIntegrityRetriever)
@adapter(Interface, Interface)
class GraphBlockLinksRetriever:
    order = 100
    block_type = BLOCK_TYPE

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, block):
        reference = file_reference(block.get("csvFile"))
        return [reference] if "resolveuid" in reference else []
