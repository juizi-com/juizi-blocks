"""Other calendars, by iCal link: downloaded in the background and cached."""

from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import wait
from datetime import date
from datetime import datetime
from datetime import timedelta
from juizi.blocks.calendar import fetch
from juizi.blocks.calendar.entry import Entry

import hashlib
import html
import icalendar
import logging
import pytz
import re
import recurring_ical_events
import threading
import time


logger = logging.getLogger("juizi.blocks")

FRESH = 15 * 60
RETRY = 60
STALE = 24 * 60 * 60
WAIT = 6  # seconds a request waits for downloads
MAX_EVENTS = 5000
MAX_CACHED = 256
DESCRIPTION_LIMIT = 300
TOO_OFTEN = ("SECONDLY", "MINUTELY", "HOURLY")
BLOCK_TAG = re.compile(r"<\s*(br|/p|/div|/li)[^>]*>", re.I)
TAG = re.compile(r"</?[a-zA-Z][^>]*>")


def plain_text(value, limit: int = 0) -> str:
    text = html.unescape(TAG.sub("", BLOCK_TAG.sub(" ", str(value or ""))))
    # Again: markup can arrive escaped.
    text = " ".join(TAG.sub("", text).split())
    if limit and len(text) > limit:
        text = text[: limit - 1].rstrip() + "…"
    return text


def parse(body: bytes):
    if b"BEGIN:VCALENDAR" not in body[:2048].upper():
        raise ValueError("not an iCal file")
    calendar = icalendar.Calendar.from_ical(body)
    kept = []
    events = 0
    for component in calendar.subcomponents:
        if component.name == "VEVENT":
            rules = component.get("RRULE") or []
            rules = rules if isinstance(rules, list) else [rules]
            if any(
                str(freq).upper() in TOO_OFTEN
                for rule in rules
                for freq in rule.get("FREQ", [])
            ):
                continue
            if component.get("DTSTART") is None:
                continue
            events += 1
            if events > MAX_EVENTS:
                break
        kept.append(component)
    calendar.subcomponents = kept
    return calendar


class Feeds:
    def __init__(self):
        self._lock = threading.Lock()
        self._pool = ThreadPoolExecutor(
            max_workers=4, thread_name_prefix="juizi-calendar"
        )
        self.clear()

    def clear(self):
        with self._lock:
            self._good = {}  # url → (when, calendar)
            self._failed = {}  # url → when
            self._running = {}  # url → future

    def _load(self, url: str):
        try:
            calendar = parse(fetch.fetch(url))
        except Exception as error:
            # Never log the link: it can be a password.
            ref = hashlib.sha256(url.encode("utf-8")).hexdigest()[:8]
            reason = (
                error if isinstance(error, fetch.FetchError) else type(error).__name__
            )
            logger.warning("Calendar link %s can't be read: %s", ref, reason)
            with self._lock:
                self._failed[url] = time.monotonic()
                self._running.pop(url, None)
            return
        with self._lock:
            if len(self._good) >= MAX_CACHED:
                self._good.pop(min(self._good, key=lambda key: self._good[key][0]))
            self._good[url] = (time.monotonic(), calendar)
            self._failed.pop(url, None)
            self._running.pop(url, None)

    def _refresh(self, url: str):
        with self._lock:
            now = time.monotonic()
            if url in self._running:
                return self._running[url]
            if url in self._good and now - self._good[url][0] < FRESH:
                return None
            if url in self._failed and now - self._failed[url] < RETRY:
                return None
            future = self._pool.submit(self._load, url)
            # It may already have finished, but then _load is waiting on
            # this lock to take itself out again.
            self._running[url] = future
            return future

    def read(self, urls, may_wait: bool = True) -> dict:
        """url → (state, calendar), state "ok", "pending" or "failed".

        A request that may wait gets the newer copy of an old one, so that
        whoever comes first after a quiet week sees this week's events. An
        older copy is used where it can't wait, or the newer is slow or fails.
        """
        waiting = []
        for url in dict.fromkeys(urls):
            future = self._refresh(url)
            # A calendar known to be down doesn't hold up everyone's retry.
            known_down = url in self._good and url in self._failed
            if future is not None and not known_down:
                waiting.append(future)
        if may_wait and waiting:
            wait(waiting, timeout=WAIT)
        result = {}
        with self._lock:
            for url in urls:
                if url in self._good:
                    result[url] = ("ok", self._good[url][1])
                elif url in self._running or url not in self._failed:
                    result[url] = ("pending", None)
                else:
                    result[url] = ("failed", None)
        return result

    def days_stale(self, url: str) -> int:
        """Whole days since a failing calendar could last be read; 0 for one
        that's working, however long ago anybody looked."""
        with self._lock:
            if url not in self._failed or url not in self._good:
                return 0
            age = time.monotonic() - self._good[url][0]
        return int(age // STALE)


feeds = Feeds()


def safe_link(value) -> str:
    text = str(value or "").strip()
    return text if re.match(r"^https?://[^\s\"<>]+$", text, re.I) else ""


def event_span(event, site_tz) -> tuple:
    """Start, end and whether it's all day; an all-day end is its last day."""
    start = event.decoded("DTSTART")
    if event.get("DTEND") is not None:
        end = event.decoded("DTEND")
    elif event.get("DURATION") is not None:
        end = start + event.decoded("DURATION")
    else:
        end = start
    if not isinstance(start, datetime):
        if isinstance(end, datetime):
            end = end.date()
        if end > start:
            end -= timedelta(days=1)  # iCal's end day is exclusive
        return start, end, True
    if start.tzinfo is None:
        start = site_tz.localize(start)
    if not isinstance(end, datetime):
        end = start
    elif end.tzinfo is None:
        end = site_tz.localize(end)
    return start, end, False


def calendar_entries(calendar, item, options, after: date, before: date) -> list:
    """The feed's entries."""
    site_tz = pytz.timezone(options.site_timezone)
    found = recurring_ical_events.of(calendar).between(
        after - timedelta(days=1), before + timedelta(days=2)
    )
    entries = []
    for event in found:
        if str(event.get("STATUS", "")).upper() == "CANCELLED":
            continue
        uid = str(event.get("UID", ""))
        start, end, all_day = event_span(event, site_tz)
        seed = f"{item.id}|{uid}|{event.get('SUMMARY', '')}|{start.isoformat()}"
        entry = Entry(
            id=f"feed-{hashlib.sha256(seed.encode('utf-8')).hexdigest()[:24]}",
            title=plain_text(event.get("SUMMARY"), 200),
            start=start,
            end=end,
            all_day=all_day,
            url=safe_link(event.get("URL")),
            description=plain_text(event.get("DESCRIPTION"), DESCRIPTION_LIMIT),
            location=plain_text(event.get("LOCATION"), 200),
            types=[item.id],
        )
        if entry.overlaps(options.tz, after, before):
            entries.append(entry)
    return entries
