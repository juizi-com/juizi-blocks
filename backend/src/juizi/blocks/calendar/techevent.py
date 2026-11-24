"""collective.techevent's sessions and slots, where that add-on is installed.

The calendar works without it, and nothing here needs it to import. Its
Talks, Trainings and Keynotes may be events too (Juizi's fork); its other
slots never are.
"""

from plone.uuid.interfaces import IUUID
from Products.CMFCore.utils import getToolByName
from zope.i18n import translate

import pytz


try:
    from collective.techevent.behaviors.schedule import IScheduleSlot
    from collective.techevent.behaviors.session import IEventSession
    from collective.techevent.interfaces import IEventRoot
except ImportError:
    IScheduleSlot = IEventSession = IEventRoot = None

SLOT_BEHAVIOR = "collective.techevent.schedule"
# Talks, Keynotes and Trainings: the ones with a track, level and audience.
SESSION_BEHAVIOR = "collective.techevent.session"
# What editors may sort sessions by. Rooms stay readable in saved calendars.
SESSION_LISTS = ("session_track", "session_level", "session_audience")
# Index: the field on the event's settings that lists its terms.
TERMS = {
    "session_track": "tracks",
    "session_audience": "audience",
    "session_level": "levels",
    "slot_room": None,  # rooms are pages
}
# Time between sessions. On a month they would push the sessions out of
# sight, so they only show under an event type that asks for them.
ROUTINE = ("Break", "Slot")


def is_slot(obj) -> bool:
    return IScheduleSlot is not None and IScheduleSlot.providedBy(obj)


def utc(value):
    """plone.restapi saves a slot's times as UTC, without saying so."""
    if value.tzinfo is None:
        return pytz.utc.localize(value)
    return value


def dates_only(start, end) -> bool:
    """A slot has no "whole day": editors leave both times at 00:00 UTC."""
    times = [utc(value).astimezone(pytz.utc) for value in (start, end)]
    return all((value.hour, value.minute) == (0, 0) for value in times)


def event_roots(context) -> list:
    if IEventRoot is None:
        return []
    portal = getToolByName(context, "portal_url").getPortalObject()
    roots = [portal] if IEventRoot.providedBy(portal) else []
    catalog = getToolByName(context, "portal_catalog")
    for brain in catalog.searchResults(
        object_provides=IEventRoot.__identifier__,
        path="/".join(portal.getPhysicalPath()),
    ):
        if brain.getPath() != "/".join(portal.getPhysicalPath()):
            roots.append(brain._unrestrictedGetObject())
    return roots


def roots_by_uid(context) -> dict:
    found = {}
    for root in event_roots(context):
        uid = IUUID(root, None)
        if uid:
            found[uid] = root
    return found


def root_lists(root) -> dict:
    """A tech event's own tracks, levels and audiences: index → [[id, title]]."""
    found = {}
    for index in SESSION_LISTS:
        rows = getattr(root, TERMS[index], None) or ()
        terms = [
            [row["id"], row.get("title") or row["id"]] for row in rows if row.get("id")
        ]
        if terms:
            found[index] = terms
    return found


def room_titles(context, uids=None) -> dict:
    catalog = getToolByName(context, "portal_catalog")
    query = {"portal_type": "Room"}
    if uids is not None:
        if not uids:
            return {}
        query["UID"] = sorted(uids)
    return {brain.UID: brain.Title for brain in catalog.searchResults(**query)}


def term_titles(context, index: str) -> dict:
    if IEventRoot is None or index not in TERMS:
        return {}
    if TERMS[index] is None:
        return room_titles(context)
    titles = {}
    for root in event_roots(context):
        for row in getattr(root, TERMS[index], None) or ():
            if row.get("id"):
                titles.setdefault(row["id"], row.get("title") or row["id"])
    return titles


def index_title(index: str, request) -> str:
    if index == "slot_room":
        title = IScheduleSlot["room"].title
    else:
        title = IEventSession[index].title
    return str(translate(title, context=request))
