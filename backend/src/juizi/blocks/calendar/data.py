"""One month, as the block draws it."""

from datetime import date
from datetime import datetime
from datetime import timedelta
from juizi.blocks.calendar import OTHER
from juizi.blocks.calendar import store
from juizi.blocks.calendar import taxonomy
from juizi.blocks.calendar import techevent
from juizi.blocks.calendar.events import local_entries
from juizi.blocks.calendar.feeds import calendar_entries
from juizi.blocks.calendar.feeds import feeds
from juizi.blocks.calendar.options import Options
from plone.registry.interfaces import IRegistry
from urllib.parse import urlsplit
from zope.component import getUtility
from zope.component import queryUtility
from zope.schema.interfaces import IVocabularyFactory

import calendar
import logging
import re


logger = logging.getLogger("juizi.blocks")

MONTH = re.compile(r"^(\d{4})-(\d{2})$")
LOOK_AHEAD = 366


def parse_month(value, today: date):
    """The month's first day; this month when none is given; None when
    unusable."""
    if not value:
        return today.replace(day=1)
    found = MONTH.match(value) if isinstance(value, str) else None
    if not found:
        return None
    year, month = int(found.group(1)), int(found.group(2))
    if not (1970 <= year <= 2100 and 1 <= month <= 12):
        return None
    return date(year, month, 1)


def month_range(first: date, week_start: int) -> tuple:
    """Last day of the month, and the first and last cell of the grid."""
    last = first.replace(day=calendar.monthrange(first.year, first.month)[1])
    grid_start = first - timedelta(days=(first.weekday() - week_start) % 7)
    grid_end = last + timedelta(days=(week_start + 6 - last.weekday()) % 7)
    return last, grid_start, grid_end


def vocabulary_titles(context, index: str) -> dict:
    if index in techevent.TERMS:
        return techevent.term_titles(context, index)
    behavior = taxonomy.taxonomies(context).get(index)
    if behavior is not None:
        name = behavior.vocabulary_name
    else:
        record = f"plone.app.querystring.field.{index}.vocabulary"
        name = getUtility(IRegistry).get(record)
    factory = queryUtility(IVocabularyFactory, name=name) if name else None
    if factory is None:
        return {}
    return {term.value: taxonomy.term_title(term) for term in factory(context)}


def item_label(context, item, link: str) -> str:
    if item.label:
        return item.label
    if item.source == "feed":
        try:
            return urlsplit(link).hostname or ""
        except ValueError:
            return ""
    titles = {}
    if item.source in ("taxonomy", "session"):
        titles = vocabulary_titles(context, item.taxonomy)
    elif item.source == "type":
        types = context.portal_types
        for value in item.values:
            info = types.getTypeInfo(value)
            if info is not None:
                titles[value] = str(info.Title())
    return ", ".join(titles.get(value, value) for value in item.values)


def in_editors_order(entries: list, types: list, tz) -> list:
    rank = {kind["id"]: position for position, kind in enumerate(types)}

    def order(entry):
        first = min((rank.get(key, len(rank)) for key in entry.types), default=0)
        return entry.order(tz, first)

    return sorted(entries, key=order)


def stale_feeds(links: dict) -> list:
    """The items whose calendar has been failing for a day or more."""
    found = []
    for key, url in links.items():
        days = feeds.days_stale(url) if url else 0
        if days:
            found.append({"id": key, "days": days})
    return found


def month_data(
    context,
    options: Options,
    month=None,
    may_wait: bool = True,
    allow_unsaved: bool = False,
    now=None,
):
    """None for a month that can't be shown."""
    tz = options.tz
    now = now.astimezone(tz) if now else datetime.now(tz)
    first = parse_month(month, now.date())
    if first is None:
        return None
    last, grid_start, grid_end = month_range(first, options.week_start)

    entries = local_entries(context, options, grid_start, grid_end, runs=True)

    links = {
        item.id: store.resolve_link(item.feed, allow_unsaved)
        for item in options.feed_items
    }
    states = feeds.read([url for url in links.values() if url], may_wait)
    failed, pending, calendars = [], [], []
    for item in options.feed_items:
        state, loaded = states.get(links[item.id], ("failed", None))
        if state == "ok":
            try:
                entries += calendar_entries(loaded, item, options, grid_start, grid_end)
                calendars.append((item, loaded))
            except Exception as error:
                logger.warning(
                    "Calendar item %s can't be expanded: %s",
                    item.id,
                    type(error).__name__,
                )
                failed.append(item.id)
        elif state == "pending":
            pending.append(item.id)
        else:
            failed.append(item.id)

    next_date = None
    if not any(entry.overlaps(tz, first, last) for entry in entries):
        after = last + timedelta(days=1)
        until = after + timedelta(days=LOOK_AHEAD)
        coming = local_entries(context, options, after, until, runs=True)
        for item, loaded in calendars:
            coming += calendar_entries(loaded, item, options, after, until)
        if coming:
            soonest = min(entry.days(tz)[0] for entry in coming)
            next_date = max(after, soonest).isoformat()

    types = [
        {
            "id": item.id,
            "label": item_label(context, item, links.get(item.id, "")),
            "color": item.color,
        }
        for item in options.items
    ]
    if options.show_other:
        types.append({"id": OTHER, "label": "", "color": ""})

    return {
        "month": f"{first:%Y-%m}",
        "today": now.date().isoformat(),
        "weekStart": options.week_start,
        "timezone": options.timezone,
        "timezoneDiffers": options.timezone != options.site_timezone,
        "types": types,
        "events": [entry.as_json(tz) for entry in in_editors_order(entries, types, tz)],
        "failed": failed,
        "pending": pending,
        # For editors only: their preview is what may read unsaved settings.
        "stale": stale_feeds(links) if allow_unsaved else [],
        "next": next_date,
    }
