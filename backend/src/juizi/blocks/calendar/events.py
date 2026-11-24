"""This site's events for a range of days, from the catalog alone.

Everything here is searched as the current user, so visitors only get
published, unexpired events.
"""

from datetime import date
from datetime import datetime
from datetime import time
from datetime import timedelta
from DateTime import DateTime
from juizi.blocks.calendar import OTHER
from juizi.blocks.calendar import techevent
from juizi.blocks.calendar.entry import Entry
from juizi.blocks.calendar.indexers import ONCE
from juizi.blocks.calendar.indexers import REPEATS
from juizi.blocks.calendar.options import Options
from juizi.blocks.calendar.recurrence import day_runs
from juizi.blocks.calendar.recurrence import ends
from juizi.blocks.calendar.recurrence import inside_itself
from juizi.blocks.calendar.recurrence import occurrence_starts
from juizi.blocks.graph.transforms import file_reference
from juizi.blocks.graph.transforms import find_file
from plone.base.navigationroot import get_navigation_root
from Products.CMFCore.utils import getToolByName

import pytz


DESCRIPTION_LIMIT = 300
# As the block's LONG_DAYS: this many days after the first is a thin bar.
LONG_DAYS = 3
# The longest run of days looked for past the edges of the month.
RUN_LIMIT = timedelta(days=92)


def search_path(context, options: Options):
    """The chosen folder, else the navigation root (the language folder on
    a multilingual site). None when the chosen folder is gone."""
    reference = file_reference(options.folder)
    if not reference:
        return get_navigation_root(context)
    folder = find_file(context, reference)
    return "/".join(folder.getPhysicalPath()) if folder is not None else None


def all_day_date(value: datetime, zone: str, site_zone: str) -> date:
    """The day an all-day event was meant for.

    Volto sends times in UTC, so a new all-day event can be stored as 22:00
    UTC the evening before: read those in the site's zone. A clean midnight
    or 23:59 already means that day.
    """
    at = (value.hour, value.minute)
    if zone == "UTC" and at not in ((0, 0), (23, 59)):
        return value.astimezone(pytz.timezone(site_zone)).date()
    return value.date()


def base_queries(path: str, after: date, before: date, kinds=None) -> list:
    """``kinds``: the content types the site owner lets calendars show."""
    # A day either side for time zones; precise overlap is checked later.
    low = DateTime((after - timedelta(days=2)).isoformat() + " 00:00:00 UTC")
    high = DateTime((before + timedelta(days=2)).isoformat() + " 23:59:59 UTC")
    queries = [
        {
            "path": path,
            "juizi_event_kind": ONCE,
            "start": {"query": high, "range": "max"},
            "end": {"query": low, "range": "min"},
        },
        # Every series: the date indexes can't place them (see indexers).
        {"path": path, "juizi_event_kind": REPEATS},
    ]
    if kinds is not None:
        for query in queries:
            query["portal_type"] = list(kinds)
    return queries


def item_criteria(item) -> dict:
    index = {
        "tags": "Subject",
        "type": "portal_type",
        "taxonomy": item.taxonomy,
        "session": item.taxonomy,
    }[item.source]
    criteria = {"query": item.values}
    if item.source != "type":
        criteria["operator"] = "and" if item.match_all else "or"
    found = {index: criteria}
    if item.kinds and item.source != "type":
        found["portal_type"] = list(item.kinds)
    if item.path:
        # Replaces the calendar's folder: only events found there are shown.
        found["path"] = item.path
    return found


def matched_types(catalog, queries: list, options: Options) -> dict:
    """Record id → the ids of the items it matches, in the block's order."""
    matched = {}
    indexes = set(catalog.indexes())
    for item in options.local_items:
        criteria = item_criteria(item)
        if not set(criteria) <= indexes:
            continue  # a taxonomy that has been deleted
        for query in queries:
            # The rule's kinds are within the query's: both must hold.
            search = {**query, **criteria}
            if "portal_type" in query and "portal_type" in criteria:
                allowed = set(query["portal_type"])
                wanted = criteria["portal_type"]
                if isinstance(wanted, dict):  # a "type" rule
                    wanted = wanted["query"]
                search["portal_type"] = [kind for kind in wanted if kind in allowed]
                if not search["portal_type"]:
                    continue
            for brain in catalog.searchResults(**search):
                found = matched.setdefault(brain.getRID(), [])
                if item.id not in found:
                    found.append(item.id)
    return matched


def brain_text(brain, name: str) -> str:
    value = getattr(brain, name, "")
    return value if isinstance(value, str) else ""


def first_occurrence(info: dict, options: Options) -> tuple:
    """Its zone, its clock-time start (naive) and how long it lasts."""
    zone = info["zone"] if info["zone"] in pytz.all_timezones_set else "UTC"
    event_tz = pytz.timezone(zone)
    start, end = (
        value.astimezone(event_tz) if value.tzinfo else event_tz.localize(value)
        for value in map(datetime.fromisoformat, (info["start"], info["end"]))
    )
    if info["whole_day"]:
        first = all_day_date(start, zone, options.site_timezone)
        last = first
        if not info["open_end"]:
            last = max(first, all_day_date(end, zone, options.site_timezone))
        return event_tz, datetime.combine(first, time(0)), last - first
    clock = start.replace(tzinfo=None)
    clock_end = clock if info["open_end"] else end.replace(tzinfo=None)
    return event_tz, clock, max(timedelta(0), clock_end - clock)


def mend_series(clock: datetime, duration: timedelta, info: dict) -> tuple:
    """The rule and length meant by a series that repeats inside itself."""
    rule = info["recurrence"]
    last = clock + duration
    nested = inside_itself(clock, last, rule)
    if not nested:
        return rule, duration
    if info["whole_day"]:
        every_day = len(nested) == (last.date() - clock.date()).days + 1
        return ("", duration) if every_day else (rule, timedelta(0))
    if last.time() > clock.time():  # those days' sessions
        return rule, last - datetime.combine(last.date(), clock.time())
    return "", duration


def occurrence_spans(
    clock: datetime,
    duration: timedelta,
    rule: str,
    after: date,
    before: date,
    runs: bool,
) -> list:
    """(first start, last start, joined). Joined is days in a row with the
    same hours, which a month draws as one long event."""
    low = datetime.combine(after - timedelta(days=2), time(0))
    high = datetime.combine(before + timedelta(days=2), time.max)
    one_day = (clock + duration).date() == clock.date()
    if not (runs and rule and one_day and ends(rule)):
        starts = occurrence_starts(clock, rule, low, high, duration)
        return [(value, value, False) for value in starts]

    starts = occurrence_starts(clock, rule, low - RUN_LIMIT, high + RUN_LIMIT, duration)
    spans = []
    for run in day_runs(starts):
        if len(run) > LONG_DAYS:
            spans.append((run[0], run[-1], True))
        else:
            spans.extend((value, value, False) for value in run)
    return spans


def brain_entries(
    brain, types, options: Options, after: date, before: date, runs: bool = False
):
    info = getattr(brain, "juizi_event_info", None)
    if not isinstance(info, dict):
        return
    event_tz, clock, duration = first_occurrence(info, options)
    rule, duration = mend_series(clock, duration, info)
    all_day, open_end = info["whole_day"], info["open_end"]

    spans = occurrence_spans(clock, duration, rule, after, before, runs)
    for value, last_value, joined in spans:
        key = f"{brain.UID}-{value:%Y%m%dT%H%M}" if rule else brain.UID
        if all_day:
            begins, finishes = value.date(), (last_value + duration).date()
        else:
            begins = event_tz.localize(value)
            finishes = event_tz.localize(last_value + duration)
        entry = Entry(
            id=f"{brain.UID}-{value:%Y%m%dT%H%M}",
            key=key,
            title=brain_text(brain, "Title") or brain.getId,
            start=begins,
            end=finishes,
            all_day=all_day,
            open_end=open_end and not all_day,
            daily=joined and not all_day,
            url="" if info["entry_only"] else brain.getURL(),
            path="" if info["entry_only"] else brain.getPath(),
            description=brain_text(brain, "Description")[:DESCRIPTION_LIMIT],
            location=brain_text(brain, "location"),
            language=brain_text(brain, "Language"),
            types=list(types),
        )
        if entry.overlaps(options.tz, after, before):
            yield entry


def is_slot_record(brain) -> bool:
    info = getattr(brain, "juizi_event_info", None)
    return isinstance(info, dict) and "rooms" in info


def shown_records(catalog, queries: list, options: Options):
    """Each record to show, with its types."""
    matched = matched_types(catalog, queries, options)
    fallback = [OTHER] if options.show_other else []
    seen = set()
    for query in queries:
        for brain in catalog.searchResults(**query):
            rid = brain.getRID()
            if rid in seen:
                continue
            seen.add(rid)
            types = matched.get(rid)
            if not types:
                if brain.portal_type in techevent.ROUTINE and is_slot_record(brain):
                    continue
                types = fallback
            if types:
                yield brain, types


def name_rooms(context, in_rooms: list):
    """A session is where its rooms are. One search, as the current user, so
    only rooms they may see."""
    uids = {uid for _entries, rooms in in_rooms for uid in rooms}
    if not uids:
        return
    names = techevent.room_titles(context, uids)
    for entries, rooms in in_rooms:
        where = ", ".join(sorted(filter(None, map(names.get, rooms))))
        for entry in entries:
            entry.location = entry.location or where


def local_entries(
    context, options: Options, after: date, before: date, runs: bool = False
) -> list:
    """``runs`` for drawing a month. The subscribe file gets each day by itself."""
    path = search_path(context, options)
    if path is None:
        return []
    catalog = getToolByName(context, "portal_catalog")
    if "juizi_event_kind" not in catalog.indexes():
        return []  # the upgrade step hasn't run
    if options.available == []:
        return []  # every kind switched off
    queries = base_queries(path, after, before, options.available)
    entries = []
    in_rooms = []
    for brain, types in shown_records(catalog, queries, options):
        found = list(brain_entries(brain, types, options, after, before, runs))
        entries.extend(found)
        if found and is_slot_record(brain):
            in_rooms.append((found, brain.juizi_event_info["rooms"]))
    name_rooms(context, in_rooms)
    return entries
