"""What the calendar needs from each event, kept in the catalog.

``start`` and ``end`` can't be used for repeating events: Plone indexes a
series from its *next* occurrence, so past months lose it, and stops after
1,000 dates. These hold the event as saved instead.
"""

from juizi.blocks.calendar import techevent
from plone.app.event.dx.behaviors import IEventBasic
from plone.event.interfaces import IEvent
from plone.event.utils import pydt
from plone.indexer.decorator import indexer

import pytz


ONCE = "once"
REPEATS = "repeats"


def zone_name(value) -> str:
    tzinfo = getattr(value, "tzinfo", None)
    return getattr(tzinfo, "zone", None) or getattr(tzinfo, "key", None) or "UTC"


def event_kind(obj):
    if techevent.is_slot(obj) and not getattr(obj, "start", None):
        raise AttributeError("juizi_event_kind")  # not scheduled yet
    return REPEATS if getattr(obj, "recurrence", None) else ONCE


def event_info(obj):
    slot = techevent.is_slot(obj)
    source = obj if slot else IEventBasic(obj, None)
    if source is None or not getattr(source, "start", None):
        raise AttributeError("juizi_event_info")
    start, end = source.start, getattr(source, "end", None) or source.start
    whole_day = bool(getattr(source, "whole_day", False))
    if slot:
        start, end = techevent.utc(start), techevent.utc(end)
        if not whole_day and techevent.dates_only(start, end):
            whole_day = True
            start, end = start.astimezone(pytz.utc), end.astimezone(pytz.utc)
    start, end = pydt(start, exact=False), pydt(end, exact=False)
    info = {
        "start": start.isoformat(),
        "end": end.isoformat(),
        "zone": zone_name(start),
        "whole_day": whole_day,
        "open_end": bool(getattr(source, "open_end", False)),
        "recurrence": getattr(obj, "recurrence", None) or "",
        "entry_only": bool(getattr(obj, "calendar_entry_only", False)),
    }
    if slot:
        info["rooms"] = sorted(getattr(obj, "room", None) or ())
    return info


@indexer(IEvent)
def juizi_event_kind(obj):
    return event_kind(obj)


@indexer(IEvent)
def juizi_event_info(obj):
    return event_info(obj)
