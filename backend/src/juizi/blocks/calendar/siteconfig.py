"""What the site owner lets calendars offer editors.

Set in Site Setup > Juizi Blocks > Calendar (``@juizi-calendar-settings``).

- Kinds of event: a content type can appear in calendars when it has the
  "Calendar entry only" behaviour, so that tick box and the permission are
  one switch. Nothing about kinds is kept in the registry.
- Lists: the taxonomies editors may sort events by, each with the name
  editors see. Choosing lists only tidies the sidebar: a saved calendar
  that sorts by a list taken off here keeps working.
- Other calendars: whether editors may add calendars by their link. Off
  means calendars leave them out, saved ones included.

Kept in the ``juizi.blocks.calendar_config`` record as JSON::

    {"taxonomies": [{"id": "taxonomy_themes", "label": "Event themes"}],
     "feeds": false}
"""

from juizi.blocks.calendar import techevent
from juizi.blocks.calendar.behavior import BEHAVIOR
from juizi.blocks.calendar.behavior import EVENT_BEHAVIORS
from plone.registry.interfaces import IRegistry
from Products.CMFCore.utils import getToolByName
from zope.component import queryUtility

import json
import re


RECORD = "juizi.blocks.calendar_config"
DEFAULT_CALENDAR_CONFIG = {"taxonomies": [], "feeds": False}
DEFAULT_CALENDAR_CONFIG_JSON = json.dumps(DEFAULT_CALENDAR_CONFIG, indent=2)
# Content types that have dates a calendar can place.
SCHEDULED = (*EVENT_BEHAVIORS, techevent.SLOT_BEHAVIOR)
INDEX = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,79}$")
MAX_TAXONOMIES = 30
MAX_LABEL = 80


class CalendarConfigError(ValueError):
    """Settings that can't be saved."""


def validate(value) -> dict:
    if not isinstance(value, dict):
        raise CalendarConfigError("Calendar settings must be an object")
    raw = value.get("taxonomies", [])
    if not isinstance(raw, list) or len(raw) > MAX_TAXONOMIES:
        raise CalendarConfigError(f"At most {MAX_TAXONOMIES} lists can be chosen")
    taxonomies = []
    seen = set()
    for entry in raw:
        if not isinstance(entry, dict):
            raise CalendarConfigError("Each list must be an object")
        index = entry.get("id")
        if not isinstance(index, str) or not INDEX.match(index):
            raise CalendarConfigError(f"Unknown list: {index!r}")
        label = entry.get("label") or ""
        if not isinstance(label, str) or len(label) > MAX_LABEL:
            raise CalendarConfigError(f"The name for {index!r} is too long")
        if index not in seen:
            seen.add(index)
            taxonomies.append({"id": index, "label": label.strip()})
    feeds = value.get("feeds", False)
    if not isinstance(feeds, bool):
        raise CalendarConfigError("'feeds' must be true or false")
    return {"taxonomies": taxonomies, "feeds": feeds}


def load(raw) -> dict:
    """The stored settings; anything unusable counts as the defaults."""
    if raw:
        try:
            return validate(json.loads(raw))
        except (ValueError, TypeError):
            pass
    return json.loads(DEFAULT_CALENDAR_CONFIG_JSON)


def read() -> dict:
    registry = queryUtility(IRegistry)
    # A site whose upgrade step hasn't run has no record yet.
    return load(registry.get(RECORD) if registry is not None else None)


def save(config: dict):
    registry = queryUtility(IRegistry)
    registry[RECORD] = json.dumps(validate(config), indent=2)


def candidate_types(context) -> list:
    """The content types that could appear in calendars."""
    found = []
    for info in getToolByName(context, "portal_types").objectValues():
        behaviors = getattr(info, "behaviors", None) or ()
        if any(name in SCHEDULED for name in behaviors):
            found.append(info)
    return found


def is_available(info) -> bool:
    return BEHAVIOR in (getattr(info, "behaviors", None) or ())


def is_session(info) -> bool:
    return techevent.SESSION_BEHAVIOR in (getattr(info, "behaviors", None) or ())


def available_types(context) -> list:
    return [info.getId() for info in candidate_types(context) if is_available(info)]


def session_types(context) -> list:
    """The available kinds that have a track, level and audience."""
    return [
        info.getId()
        for info in candidate_types(context)
        if is_available(info) and is_session(info)
    ]


def set_available(context, type_ids):
    """Switch kinds on and off. Only content types with dates are touched."""
    wanted = set(type_ids)
    for info in candidate_types(context):
        behaviors = tuple(info.behaviors)
        if info.getId() in wanted and BEHAVIOR not in behaviors:
            info.manage_changeProperties(behaviors=(*behaviors, BEHAVIOR))
        elif info.getId() not in wanted and BEHAVIOR in behaviors:
            info.manage_changeProperties(
                behaviors=tuple(name for name in behaviors if name != BEHAVIOR)
            )
