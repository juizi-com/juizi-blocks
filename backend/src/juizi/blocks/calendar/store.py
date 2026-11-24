"""Where pasted calendar links are kept.

A private iCal link works like a password. It can't stay in the block:
``@search?metadata_fields=blocks`` hands any visitor the raw blocks, past
every serializer. So saving the page moves the link here, and the block
keeps a reference that is no use for reading the link back.
"""

from BTrees.OOBTree import OOBTree
from plone import api
from urllib.parse import urlsplit
from zope.annotation.interfaces import IAnnotations

import hashlib
import re


STORE_KEY = "juizi.blocks.calendar.links"
REFERENCE = re.compile(r"^Saved link \([^)]{0,253}\) #([0-9a-f]{32})$")
SCHEME = re.compile(r"^[a-z][a-z0-9+.-]*://", re.I)


def is_reference(value: str) -> bool:
    return bool(REFERENCE.match(value or ""))


def as_url(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if not SCHEME.match(value):
        value = f"https://{value.lstrip('/')}"
    return re.sub(r"^webcals?://", "https://", value, flags=re.I)


def save_link(value: str) -> str:
    url = as_url(value)
    if not url:
        return ""
    key = hashlib.sha256(url.encode("utf-8")).hexdigest()[:32]
    annotations = IAnnotations(api.portal.get())
    if STORE_KEY not in annotations:
        annotations[STORE_KEY] = OOBTree()
    if key not in annotations[STORE_KEY]:
        annotations[STORE_KEY][key] = url
    try:
        host = re.sub(r"[^a-zA-Z0-9.-]", "", urlsplit(url).hostname or "")
    except ValueError:
        host = ""
    return f"Saved link ({host[:253] or 'calendar'}) #{key}"


def resolve_link(value: str, allow_unsaved: bool = False) -> str:
    """The link behind a reference. A typed link only counts in an editor's
    preview: never for visitors."""
    found = REFERENCE.match(value or "")
    if not found:
        return as_url(value) if allow_unsaved else ""
    links = IAnnotations(api.portal.get()).get(STORE_KEY)
    return links.get(found.group(1), "") if links is not None else ""
