"""POST /<page>/@juizi-graph-data: the editor's live preview.

While an editor links a file, changes the separator or switches between a
chart and a table, the block asks for the table again instead of waiting
for the page to be saved and reloaded. Pasting data in the sidebar goes
through here too, so files and pasted data are read by the same code.

Body, one of:
    {"file": "<link or resolveuid>", "delimiter": "auto", "view": "line"}
    {"text": "<pasted rows>", "delimiter": "auto", "view": "line"}

Returns the table described in ``table.py``. Editors only (Modify portal
content on the page); visitors get the data with the page.
"""

from juizi.blocks.graph import table
from juizi.blocks.graph.transforms import load_file_table
from plone.protect.interfaces import IDisableCSRFProtection
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from zope.interface import alsoProvides


class GraphDataPost(Service):
    def reply(self):
        # Reads only; nothing is written.
        alsoProvides(self.request, IDisableCSRFProtection)
        body = json_body(self.request) or {}
        delimiter = body.get("delimiter") or table.AUTO
        if delimiter not in (table.AUTO, *table.DELIMITERS):
            delimiter = table.AUTO
        view = body.get("view") if isinstance(body.get("view"), str) else None
        if isinstance(body.get("text"), str):
            return table.from_text(body["text"], delimiter, view)
        if isinstance(body.get("file"), str):
            return load_file_table(self.context, body["file"], delimiter, view)
        self.request.response.setStatus(400)
        return {"error": "Send 'file' or 'text'."}
