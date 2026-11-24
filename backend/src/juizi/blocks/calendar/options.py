"""A saved block's settings, cleaned up."""

from dataclasses import dataclass
from dataclasses import field
from juizi.blocks.calendar import BLOCK_TYPE
from juizi.blocks.calendar import siteconfig
from juizi.blocks.calendar import taxonomy
from juizi.blocks.calendar import techevent
from plone.app.event.base import default_timezone
from plone.registry.interfaces import IRegistry
from zope.component import queryUtility

import json
import pytz
import re


SOURCES = ("tags", "taxonomy", "session", "type", "feed")
MAX_ITEMS = 24
MAX_FEEDS = 6
MAX_VALUES = 50
TAXONOMY = re.compile(r"^taxonomy_\w+$")


@dataclass
class Item:
    id: str
    source: str
    label: str = ""
    color: str = ""
    values: list = field(default_factory=list)
    match_all: bool = False
    taxonomy: str = ""
    feed: str = ""
    # Only these kinds of event (content types); empty: any available kind.
    kinds: list = field(default_factory=list)
    # Only inside this tech event.
    path: str = ""


@dataclass
class Options:
    timezone: str
    site_timezone: str
    items: list
    show_other: bool
    week_start: int  # 0 Monday, 6 Sunday
    folder: object
    subscribe: bool
    # The kinds of event the site owner lets calendars show; None: any.
    available: list | None = None
    feeds_allowed: bool = True

    @property
    def tz(self):
        return pytz.timezone(self.timezone)

    @property
    def local_items(self):
        return [item for item in self.items if item.source != "feed"]

    @property
    def feed_items(self):
        if not self.feeds_allowed:
            return []
        return [item for item in self.items if item.source == "feed"][:MAX_FEEDS]


def as_text(value) -> str:
    # Select widgets save a string, vocabulary widgets {"token", "title"}.
    if isinstance(value, dict):
        value = value.get("token") or value.get("value")
    return value.strip() if isinstance(value, str) else ""


def as_list(value) -> list:
    values = value if isinstance(value, list) else [value]
    return [text for text in map(as_text, values) if text][:MAX_VALUES]


def read_item(raw, position: int, taxonomy_indexes=(), site=None):
    """The item, or None while the editor hasn't finished it.

    Rules saved since 23 November 2026 say *what* (kinds of event, or
    another calendar) and what they *filter by*; older ones a ``source``.
    """
    if not isinstance(raw, dict):
        return None
    if "what" in raw or "filterBy" in raw:
        return read_rule(raw, position, taxonomy_indexes, site or Site())
    source = as_text(raw.get("source"))
    if source not in SOURCES:
        return None
    item = new_item(raw, position, source)
    if source == "feed":
        item.feed = as_text(raw.get("feed"))
        return item if item.feed else None
    if source == "tags":
        item.values = as_list(raw.get("tags"))
    elif source == "type":
        item.values = as_list(raw.get("types"))
        item.match_all = False  # an event has one content type
    elif source == "session":
        item.taxonomy = as_text(raw.get("sessionList"))
        if item.taxonomy not in techevent.TERMS:
            return None
        item.values = as_list(raw.get("sessionTerms"))
    else:
        item.taxonomy = as_text(raw.get("taxonomy"))
        if not is_taxonomy(item.taxonomy, taxonomy_indexes):
            return None
        item.values = as_list(raw.get("terms"))
    return item if item.values else None


@dataclass
class Site:
    """What a rule needs to know about the site, looked up once a block."""

    sessions: list = field(default_factory=list)
    tech_events: dict = field(default_factory=dict)  # UID → path


def new_item(raw, position, source) -> Item:
    return Item(
        id=as_text(raw.get("@id")) or f"item-{position}",
        source=source,
        label=as_text(raw.get("label"))[:80],
        color=as_text(raw.get("color")),
        match_all=as_text(raw.get("match")) == "all",
    )


def is_taxonomy(index: str, known) -> bool:
    # Never any other index: what's searched by is in the visitor's view.
    return index in known or bool(TAXONOMY.match(index))


def read_rule(raw, position, taxonomy_indexes, site: Site):
    what = as_list(raw.get("what"))
    by = as_text(raw.get("filterBy"))
    if "feed" in what:
        item = new_item(raw, position, "feed")
        item.feed = as_text(raw.get("feed"))
        return item if item.feed else None
    kinds = [kind for kind in what if kind != "any"]
    if by == "all":
        if not kinds:
            return None  # every kind of event: that is "Show other events"
        item = new_item(raw, position, "type")
        item.values = kinds
        item.match_all = False
    elif by == "tags":
        item = new_item(raw, position, "tags")
    elif by in techevent.SESSION_LISTS:
        item = new_item(raw, position, "session")
        item.taxonomy = by
        # Only sessions have one; with no kinds picked, every kind of session.
        kinds = [kind for kind in kinds if kind in site.sessions] or site.sessions
        item.path = site.tech_events.get(as_text(raw.get("techEvent")), "")
    elif by and is_taxonomy(by, taxonomy_indexes):
        item = new_item(raw, position, "taxonomy")
        item.taxonomy = by
    else:
        return None
    if item.source != "type":
        item.values = as_list(raw.get("values"))
        item.kinds = kinds
    return item if item.values else None


def site_facts(context, raw_items) -> Site:
    site = Site()
    rules = [raw for raw in raw_items if isinstance(raw, dict) and "what" in raw]
    if not rules or techevent.IEventRoot is None:
        return site
    site.sessions = siteconfig.session_types(context)
    if any(raw.get("techEvent") for raw in rules):
        site.tech_events = {
            uid: "/".join(root.getPhysicalPath())
            for uid, root in techevent.roots_by_uid(context).items()
        }
    return site


def week_start(chosen) -> int:
    """The calendar's own choice, else the site's (Site Setup > Date and
    Time). A calendar has only Monday and Sunday weeks."""
    if chosen in ("monday", "sunday"):
        return 6 if chosen == "sunday" else 0
    registry = queryUtility(IRegistry)
    first = registry.get("plone.first_weekday") if registry is not None else 0
    return 6 if first == 6 else 0


def site_zone(context) -> str:
    name = default_timezone(context)
    return name if name in pytz.all_timezones_set else "UTC"


def read_options(context, block: dict) -> Options:
    site = site_zone(context)
    zone = as_text(block.get("timezone"))
    raw_items = block.get("items") if isinstance(block.get("items"), list) else []
    known = ()
    if any(
        isinstance(raw, dict) and (raw.get("taxonomy") or raw.get("filterBy"))
        for raw in raw_items
    ):
        known = taxonomy.taxonomies(context)
    site_info = site_facts(context, raw_items)
    config = siteconfig.read()
    items = []
    seen = set()
    for position, raw in enumerate(raw_items[:MAX_ITEMS]):
        item = read_item(raw, position, known, site_info)
        if item is None:
            continue
        if item.id in seen:  # a copied item
            item.id = f"{item.id}-{position}"
        seen.add(item.id)
        items.append(item)
    return Options(
        timezone=zone if zone in pytz.all_timezones_set else site,
        site_timezone=site,
        items=items,
        # With nothing to sort events into, all of them are shown.
        show_other=(
            block.get("showOther") is not False
            or not any(item.source != "feed" for item in items)
        ),
        week_start=week_start(block.get("weekStart")),
        folder=block.get("folder"),
        subscribe=bool(block.get("showSubscribe")),
        available=siteconfig.available_types(context),
        feeds_allowed=config["feeds"],
    )


def find_block(blocks, block_id: str):
    """The calendar saved under this id, however deeply it is nested."""
    if isinstance(blocks, str):
        try:
            blocks = json.loads(blocks)
        except ValueError:
            return None
    if not isinstance(blocks, dict):
        return None
    for key, block in blocks.items():
        if not isinstance(block, dict):
            continue
        if key == block_id and block.get("@type") == BLOCK_TYPE:
            return block
        for holder in (block, block.get("data")):
            if isinstance(holder, dict) and "blocks" in holder:
                found = find_block(holder["blocks"], block_id)
                if found is not None:
                    return found
    return None
