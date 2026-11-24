"""REST services.

GET  /<page>/@juizi-calendar?block=<id>&month=YYYY-MM   a saved block, for anyone
                                                        who may see the page
POST /<page>/@juizi-calendar {"block": {...}, "month"}  an editor's unsaved block
GET  /<page>/@juizi-calendar-options                    the sidebar's choices
GET, PATCH /@juizi-calendar-settings                    what the site owner
                                                        lets calendars offer
"""

from juizi.blocks.calendar import data
from juizi.blocks.calendar import siteconfig
from juizi.blocks.calendar import taxonomy
from juizi.blocks.calendar import techevent
from juizi.blocks.calendar.indexers import ONCE
from juizi.blocks.calendar.indexers import REPEATS
from juizi.blocks.calendar.options import find_block
from juizi.blocks.calendar.options import read_options
from juizi.blocks.calendar.options import site_zone
from juizi.blocks.calendar.options import TAXONOMY
from plone.protect.interfaces import IDisableCSRFProtection
from plone.registry.interfaces import IRegistry
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from Products.CMFCore.utils import getToolByName
from zope.component import getUtility
from zope.i18n import translate
from zope.interface import alsoProvides

import pytz


class CalendarService(Service):
    def fail(self, status: int, message: str) -> dict:
        self.request.response.setStatus(status)
        return {"error": {"type": "CalendarError", "message": message}}


class CalendarGet(CalendarService):
    def reply(self):
        form = self.request.form
        block_id = form.get("block")
        block = None
        if isinstance(block_id, str):
            block = find_block(getattr(self.context, "blocks", None), block_id)
        if block is None:
            return self.fail(404, "No such calendar on this page.")
        options = read_options(self.context, block)
        result = data.month_data(self.context, options, form.get("month"))
        if result is None:
            return self.fail(400, "Give the month as YYYY-MM.")
        return result


class CalendarPost(CalendarService):
    def reply(self):
        alsoProvides(self.request, IDisableCSRFProtection)  # reads only
        body = json_body(self.request) or {}
        if not isinstance(body.get("block"), dict):
            return self.fail(400, "Send 'block'.")
        options = read_options(self.context, body["block"])
        result = data.month_data(
            self.context, options, body.get("month"), allow_unsaved=True
        )
        if result is None:
            return self.fail(400, "Give the month as YYYY-MM.")
        return result


def term_lists(context, titles: dict) -> list:
    """The lists that have terms, by name, each with its terms."""
    found = []
    for index, title in titles.items():
        terms = data.vocabulary_titles(context, index)
        if terms:
            found.append({
                "id": index,
                "title": str(title or index),
                "terms": [list(term) for term in terms.items()],
            })
    return sorted(found, key=lambda choice: choice["title"].lower())


def taxonomy_titles(context, request) -> dict:
    """Index → the name of every taxonomy, as its add-on calls it."""
    registry = getUtility(IRegistry)
    titles = {
        index: registry.get(f"plone.app.querystring.field.{index}.title")
        for index in getToolByName(context, "portal_catalog").indexes()
        if TAXONOMY.match(index)
    }
    for index, behavior in taxonomy.taxonomies(context).items():
        title = getattr(behavior, "field_title", "") or index
        titles[index] = translate(title, context=request)
    return {index: str(title or index) for index, title in titles.items()}


def taxonomies(context, request) -> list:
    return term_lists(context, taxonomy_titles(context, request))


def kind_titles(context) -> dict:
    return {
        info.getId(): str(info.Title()) for info in siteconfig.candidate_types(context)
    }


def by_title(rows: list) -> list:
    return sorted(rows, key=lambda row: row["title"].lower())


def sidebar_options(context, request) -> dict:
    """The sidebar's choices: only what the site owner offers editors, but
    with names for anything a saved calendar still uses."""
    catalog = getToolByName(context, "portal_catalog")
    config = siteconfig.read()
    tags = {str(tag) for tag in catalog.uniqueValuesFor("Subject") if tag}
    labels = {row["id"]: row["label"] for row in config["taxonomies"]}
    lists = taxonomies(context, request)
    for row in lists:
        row["offered"] = row["id"] in labels
        row["title"] = labels.get(row["id"]) or row["title"]
    lists.sort(key=lambda row: (not row["offered"], row["title"].lower()))
    offered = {row["id"] for row in lists if row["offered"]}
    on_kinds = taxonomy.taxonomy_types(context)
    sessions = set(siteconfig.session_types(context))
    titles = kind_titles(context)
    kinds = by_title([
        {
            "id": kind,
            "title": titles.get(kind, kind),
            "session": kind in sessions,
            "lists": sorted(
                index for index in offered if kind in on_kinds.get(index, ())
            ),
        }
        for kind in siteconfig.available_types(context)
    ])
    session_lists = []
    tech_events = []
    if sessions:
        session_lists = [
            {"id": index, "title": techevent.index_title(index, request)}
            for index in techevent.SESSION_LISTS
        ]
        tech_events = by_title([
            {
                "id": uid,
                "title": str(root.Title() or root.getId()),
                "lists": techevent.root_lists(root),
            }
            for uid, root in techevent.roots_by_uid(context).items()
        ])
    return {
        "tags": sorted(tags, key=str.lower),
        "kinds": kinds,
        "taxonomies": lists,
        "sessionLists": session_lists,
        "techEvents": tech_events,
        "feeds": config["feeds"],
        "timezone": site_zone(context),
        "timezones": list(pytz.common_timezones),
    }


class CalendarOptionsGet(CalendarService):
    def reply(self):
        return sidebar_options(self.context, self.request)


def count(catalog, **query) -> int:
    """How many events (each series once) a search finds."""
    return len(catalog.searchResults(juizi_event_kind=[ONCE, REPEATS], **query))


def settings_data(context, request) -> dict:
    catalog = getToolByName(context, "portal_catalog")
    indexes = set(catalog.indexes())
    config = siteconfig.read()
    labels = {row["id"]: row["label"] for row in config["taxonomies"]}
    titles = taxonomy_titles(context, request)
    on_kinds = taxonomy.taxonomy_types(context)
    can_count = "juizi_event_kind" in indexes
    kinds = []
    for info in siteconfig.candidate_types(context):
        kind = info.getId()
        lists = [titles[index] for index in titles if kind in on_kinds.get(index, ())]
        if siteconfig.is_session(info):
            lists += [
                techevent.index_title(index, request)
                for index in techevent.SESSION_LISTS
            ]
        kinds.append({
            "id": kind,
            "title": str(info.Title()),
            "on": siteconfig.is_available(info),
            "session": siteconfig.is_session(info),
            "count": count(catalog, portal_type=kind) if can_count else None,
            "lists": sorted(lists, key=str.lower),
        })
    lists = []
    for index, title in titles.items():
        values = [value for value in catalog.uniqueValuesFor(index) if value]
        lists.append({
            "id": index,
            "title": title,
            "label": labels.get(index, ""),
            "on": index in labels,
            "kinds": on_kinds.get(index, []),
            "count": (
                count(catalog, **{index: {"query": values, "operator": "or"}})
                if can_count and values
                else 0
            ),
        })
    return {
        "@id": f"{context.absolute_url()}/@juizi-calendar-settings",
        "kinds": by_title(kinds),
        "taxonomies": by_title(lists),
        "feeds": config["feeds"],
    }


class CalendarSettingsGet(CalendarService):
    def reply(self):
        return settings_data(self.context, self.request)


class CalendarSettingsPatch(CalendarService):
    """{"kinds": [ids switched on], "taxonomies": [{"id", "label"}],
    "feeds": bool}, any of them."""

    def reply(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        body = json_body(self.request)
        if not isinstance(body, dict):
            return self.fail(400, "Send an object.")
        config = siteconfig.read()
        kinds = None
        if "kinds" in body:
            kinds = body["kinds"]
            known = {info.getId() for info in siteconfig.candidate_types(self.context)}
            if not isinstance(kinds, list) or not all(
                isinstance(kind, str) and kind in known for kind in kinds
            ):
                return self.fail(400, "Unknown kind of event.")
        if "taxonomies" in body:
            known = taxonomy_titles(self.context, self.request)
            rows = body["taxonomies"]
            if not isinstance(rows, list) or not all(
                isinstance(row, dict) and row.get("id") in known for row in rows
            ):
                return self.fail(400, "Unknown list.")
            config["taxonomies"] = rows
        if "feeds" in body:
            config["feeds"] = body["feeds"]
        try:
            siteconfig.save(config)
        except siteconfig.CalendarConfigError as error:
            return self.fail(400, str(error))
        if kinds is not None:
            siteconfig.set_available(self.context, kinds)
        return settings_data(self.context, self.request)
