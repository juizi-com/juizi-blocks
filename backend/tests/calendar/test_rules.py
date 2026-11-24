"""The calendar's rules that need no site."""

from datetime import date
from datetime import datetime
from datetime import timedelta
from juizi.blocks.calendar import data
from juizi.blocks.calendar import fetch
from juizi.blocks.calendar import feeds
from juizi.blocks.calendar import ics
from juizi.blocks.calendar.entry import Entry
from juizi.blocks.calendar.events import all_day_date
from juizi.blocks.calendar.options import find_block
from juizi.blocks.calendar.options import Item
from juizi.blocks.calendar.options import Options
from juizi.blocks.calendar.options import read_item
from juizi.blocks.calendar.options import Site
from juizi.blocks.calendar.recurrence import occurrence_starts

import icalendar
import pytest
import pytz
import time


JOBURG = pytz.timezone("Africa/Johannesburg")


def starts(start, rule, after, before, hours=1):
    return occurrence_starts(start, rule, after, before, timedelta(hours=hours))


class TestRecurrence:
    def test_weekly_series_shows_in_a_later_month(self):
        found = starts(
            datetime(2026, 6, 3, 18),
            "RRULE:FREQ=WEEKLY",
            datetime(2026, 11, 1),
            datetime(2026, 11, 30, 23, 59),
        )
        assert [value.day for value in found] == [4, 11, 18, 25]

    def test_series_longer_than_plones_thousand(self):
        found = starts(
            datetime(2020, 1, 1, 8),
            "RRULE:FREQ=DAILY",
            datetime(2026, 11, 1),
            datetime(2026, 11, 3, 23, 59),
        )
        assert len(found) == 3

    def test_until_includes_its_whole_day(self):
        found = starts(
            datetime(2026, 11, 2, 18),
            "RRULE:FREQ=DAILY;UNTIL=20261104T000000Z",
            datetime(2026, 11, 1),
            datetime(2026, 11, 30),
        )
        assert [value.day for value in found] == [2, 3, 4]

    def test_exdate_and_rdate_take_the_events_time(self):
        found = starts(
            datetime(2026, 11, 2, 18),
            "RRULE:FREQ=DAILY;COUNT=3\nEXDATE:20261103T000000\nRDATE:20261120T000000",
            datetime(2026, 11, 1),
            datetime(2026, 11, 30),
        )
        assert found == (
            datetime(2026, 11, 2, 18),
            datetime(2026, 11, 4, 18),
            datetime(2026, 11, 20, 18),
        )

    def test_occurrence_running_into_the_range(self):
        found = starts(
            datetime(2026, 10, 31, 9),
            "RRULE:FREQ=MONTHLY;COUNT=2",
            datetime(2026, 11, 2),
            datetime(2026, 11, 10),
            hours=72,
        )
        assert found == (datetime(2026, 10, 31, 9),)

    @pytest.mark.parametrize("rule", ["RRULE:FREQ=SECONDLY", "nonsense"])
    def test_bad_rules_leave_the_single_event(self, rule):
        start = datetime(2026, 11, 2, 9)
        assert starts(start, rule, datetime(2026, 11, 1), datetime(2026, 11, 30)) == (
            start,
        )


class TestDays:
    def timed(self, start, end):
        return Entry(id="a", title="A", start=start, end=end)

    def test_until_midnight_stays_on_its_day(self):
        entry = self.timed(
            JOBURG.localize(datetime(2026, 11, 4, 19)),
            JOBURG.localize(datetime(2026, 11, 5, 0)),
        )
        assert entry.days(JOBURG) == (date(2026, 11, 4), date(2026, 11, 4))

    def test_timed_event_moves_with_the_blocks_zone(self):
        entry = self.timed(
            JOBURG.localize(datetime(2026, 11, 5, 1)),
            JOBURG.localize(datetime(2026, 11, 5, 2)),
        )
        assert entry.days(pytz.utc)[0] == date(2026, 11, 4)

    @pytest.mark.parametrize("zone", ["Pacific/Auckland", "America/Los_Angeles", "UTC"])
    def test_all_day_never_shifts(self, zone):
        day = date(2026, 11, 4)
        entry = Entry(id="a", title="A", start=day, end=day, all_day=True)
        assert entry.days(pytz.timezone(zone)) == (day, day)
        assert entry.as_json(pytz.timezone(zone))["startTime"] == ""

    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            (datetime(2026, 11, 3, 22, tzinfo=pytz.utc), date(2026, 11, 4)),
            (datetime(2026, 11, 4, 0, tzinfo=pytz.utc), date(2026, 11, 4)),
            (datetime(2026, 11, 4, 21, 59, tzinfo=pytz.utc), date(2026, 11, 4)),
            (datetime(2026, 11, 4, 23, 59, tzinfo=pytz.utc), date(2026, 11, 4)),
        ],
    )
    def test_all_day_saved_by_volto_in_utc(self, value, expected):
        assert all_day_date(value, "UTC", "Africa/Johannesburg") == expected

    def test_open_end_has_no_end_time(self):
        start = JOBURG.localize(datetime(2026, 11, 4, 19))
        entry = Entry(id="a", title="A", start=start, end=start, open_end=True)
        assert entry.as_json(JOBURG)["endTime"] == ""


class TestMonth:
    def test_grid_covers_whole_weeks(self):
        assert data.month_range(date(2026, 11, 1), 0) == (
            date(2026, 11, 30),
            date(2026, 10, 26),
            date(2026, 12, 6),
        )
        assert data.month_range(date(2026, 11, 1), 6) == (
            date(2026, 11, 30),
            date(2026, 11, 1),
            date(2026, 12, 5),
        )

    @pytest.mark.parametrize("value", ["2026-13", "1200-01", "soon", ["2026-11"], 5])
    def test_bad_months(self, value):
        assert data.parse_month(value, date(2026, 11, 22)) is None


class TestOptions:
    def test_nested_block_is_found(self):
        block = {"@type": "juiziCalendar"}
        nested = {"grid": {"@type": "gridBlock", "blocks": {"cal": block}}}
        assert find_block(nested, "cal") is block
        assert find_block({"a": {"data": {"blocks": {"cal": block}}}}, "cal") is block

    def test_only_calendar_blocks_are_found(self):
        assert find_block({"cal": {"@type": "slate"}}, "cal") is None

    @pytest.mark.parametrize(
        "raw",
        [
            {"source": "tags"},
            {"source": "feed"},
            {"source": "taxonomy", "taxonomy": "portal_type", "terms": ["x"]},
            {"source": "taxonomy", "taxonomy": "campus", "terms": ["x"]},
            {"source": "session", "sessionList": "Subject", "sessionTerms": ["x"]},
            {"source": "other", "tags": ["x"]},
        ],
    )
    def test_unfinished_or_unsafe_items_are_ignored(self, raw):
        assert read_item(raw, 0) is None


def test_taxonomy_with_its_own_prefix():
    raw = {"source": "taxonomy", "taxonomy": "campus", "terms": ["x"]}
    assert read_item(raw, 0, ("campus",)).taxonomy == "campus"


def test_session_list():
    raw = {"source": "session", "sessionList": "session_track", "sessionTerms": ["a"]}
    assert read_item(raw, 0).values == ["a"]


class TestRules:
    """Rules saved since the site owner's settings: what, then filter by."""

    site = Site(sessions=["Talk", "Keynote"], tech_events={"u1": "/plone/conf"})

    def read(self, **raw):
        return read_item(raw, 0, (), self.site)

    def test_tags_on_some_kinds(self):
        item = self.read(what=["Event"], filterBy="tags", values=["Sport"])
        assert (item.source, item.kinds, item.values) == ("tags", ["Event"], ["Sport"])

    def test_any_kind_is_no_kind(self):
        assert self.read(what=["any"], filterBy="tags", values=["x"]).kinds == []
        assert self.read(filterBy="tags", values=["x"]).kinds == []

    def test_every_one_of_some_kinds(self):
        item = self.read(what=["Break", "Slot"], filterBy="all")
        assert (item.source, item.values) == ("type", ["Break", "Slot"])
        # Every kind: that is what "Show other events" is for.
        assert self.read(what=["any"], filterBy="all") is None

    def test_a_track_looks_only_at_sessions(self):
        item = self.read(what=["Event", "Talk"], filterBy="session_track", values=["a"])
        assert (item.source, item.taxonomy, item.kinds) == (
            "session",
            "session_track",
            ["Talk"],
        )
        assert self.read(filterBy="session_level", values=["a"]).kinds == [
            "Talk",
            "Keynote",
        ]

    def test_a_track_of_one_tech_event(self):
        raw = {"filterBy": "session_track", "values": ["a"], "techEvent": "u1"}
        assert self.read(**raw).path == "/plone/conf"
        assert self.read(**{**raw, "techEvent": "gone"}).path == ""

    def test_another_calendar(self):
        item = self.read(what=["feed"], feed="https://example.org/x.ics")
        assert (item.source, item.feed) == ("feed", "https://example.org/x.ics")
        assert self.read(what=["feed"]) is None

    @pytest.mark.parametrize(
        "raw",
        [
            {"what": ["Event"]},
            {"what": ["Event"], "filterBy": "tags"},
            {"what": ["Event"], "filterBy": "portal_type", "values": ["x"]},
            {"what": ["Event"], "filterBy": "slot_room", "values": ["x"]},
        ],
    )
    def test_unfinished_or_unsafe_rules_are_ignored(self, raw):
        assert read_item(raw, 0, (), self.site) is None


class TestFetchGuard:
    @pytest.mark.parametrize(
        "address",
        [
            "127.0.0.1",
            "10.1.2.3",
            "172.16.0.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "0.0.0.0",  # noqa: S104
            "224.0.0.1",
            "::1",
            "fd00::1",
            "fe80::1",
            "::ffff:127.0.0.1",
            "64:ff9b::7f00:1",
            "2002:7f00:1::",
        ],
    )
    def test_internal_addresses_are_refused(self, address):
        assert not fetch.is_public(address)

    @pytest.mark.parametrize("address", ["8.8.8.8", "2a00:1450:4001:80b::200e"])
    def test_public_addresses(self, address):
        assert fetch.is_public(address)

    @pytest.mark.parametrize(
        "url",
        [
            "file:///etc/passwd",
            "ftp://example.org/a.ics",
            "http://user:pass@example.org/a.ics",
            "http://example.org:8080/a.ics",
            "http://127.0.0.1/a.ics",
            "http://localhost/a.ics",
            "http://2130706433/a.ics",
            "http://[::1]/a.ics",
        ],
    )
    def test_bad_links_are_refused(self, url):
        with pytest.raises(fetch.FetchError):
            fetch.check_url(url)

    def test_one_internal_answer_is_enough_to_refuse(self, monkeypatch):
        answers = [(2, 1, 6, "", (ip, 443)) for ip in ("8.8.8.8", "10.0.0.1")]
        monkeypatch.setattr(fetch.socket, "getaddrinfo", lambda *a, **kw: answers)
        with pytest.raises(fetch.FetchError):
            fetch.check_url("https://example.org/a.ics")

    def test_redirect_inside_is_refused(self, monkeypatch):
        real = fetch.check_url

        def check(url):
            if "example.org" in url:
                return fetch.urlsplit(url), "8.8.8.8"
            return real(url)

        class Response:
            status = 302
            headers = {"Location": "http://169.254.169.254/latest/"}  # noqa: RUF012

            def close(self):
                pass

        monkeypatch.setattr(fetch, "check_url", check)
        monkeypatch.setattr(fetch, "open_response", lambda *a: (Response(), Response()))
        with pytest.raises(fetch.FetchError, match="public"):
            fetch.fetch("https://example.org/a.ics")


FEED = b"""BEGIN:VCALENDAR
VERSION:2.0
X-WR-TIMEZONE:Africa/Johannesburg
BEGIN:VEVENT
UID:series@example.org
DTSTART;TZID=Africa/Johannesburg:20261102T180000
DTEND;TZID=Africa/Johannesburg:20261102T190000
RRULE:FREQ=WEEKLY;COUNT=4
EXDATE;TZID=Africa/Johannesburg:20261109T180000
SUMMARY:Choir
END:VEVENT
BEGIN:VEVENT
UID:series@example.org
RECURRENCE-ID;TZID=Africa/Johannesburg:20261116T180000
DTSTART;TZID=Africa/Johannesburg:20261117T170000
DTEND;TZID=Africa/Johannesburg:20261117T180000
SUMMARY:Choir (moved)
END:VEVENT
BEGIN:VEVENT
UID:holiday@example.org
DTSTART;VALUE=DATE:20261216
DTEND;VALUE=DATE:20261217
SUMMARY:Day of <b>Reconciliation</b>
DESCRIPTION:&lt;script&gt;alert(1)&lt;/script&gt;Public holiday
URL:javascript:alert(1)
END:VEVENT
BEGIN:VEVENT
UID:off@example.org
DTSTART:20261120T100000Z
STATUS:CANCELLED
SUMMARY:Called off
END:VEVENT
BEGIN:VEVENT
UID:bomb@example.org
DTSTART:20261101T000000Z
RRULE:FREQ=SECONDLY
SUMMARY:Bomb
END:VEVENT
END:VCALENDAR
"""


def options(zone="Africa/Johannesburg"):
    return Options(zone, "Africa/Johannesburg", [], True, 0, None, False)


def feed_entries(after, before):
    item = Item(id="feed", source="feed")
    return feeds.calendar_entries(feeds.parse(FEED), item, options(), after, before)


class TestFeeds:
    def test_moved_and_excluded_dates(self):
        found = feed_entries(date(2026, 11, 1), date(2026, 11, 30))
        choir = sorted(
            (entry.days(JOBURG)[0].day, entry.title)
            for entry in found
            if "Choir" in entry.title
        )
        assert choir == [(2, "Choir"), (17, "Choir (moved)"), (23, "Choir")]

    def test_cancelled_and_too_frequent_are_left_out(self):
        titles = {e.title for e in feed_entries(date(2026, 11, 1), date(2026, 11, 30))}
        assert "Called off" not in titles
        assert "Bomb" not in titles

    def test_all_day_end_is_inclusive_and_text_is_plain(self):
        (holiday,) = feed_entries(date(2026, 12, 14), date(2026, 12, 20))
        assert (holiday.start, holiday.end) == (date(2026, 12, 16), date(2026, 12, 16))
        assert holiday.title == "Day of Reconciliation"
        assert "<" not in holiday.description
        assert holiday.url == ""

    def test_failed_feed(self, monkeypatch):
        def broken(url):
            raise fetch.FetchError("no")

        monkeypatch.setattr(feeds.fetch, "fetch", broken)
        assert (
            feeds.Feeds().read(["https://x.test/a"])["https://x.test/a"][0] == "failed"
        )

    def test_slow_feed_doesnt_hold_up_a_page(self, monkeypatch):
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: time.sleep(1) or FEED)
        began = time.monotonic()
        state = feeds.Feeds().read(["https://x.test/b"], may_wait=False)
        assert state["https://x.test/b"][0] == "pending"
        assert time.monotonic() - began < 0.5

    def test_empty_feed_is_ok(self, monkeypatch):
        empty = b"BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n"
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: empty)
        assert feeds.Feeds().read(["https://x.test/c"])["https://x.test/c"][0] == "ok"

    def test_stale_copy_survives_a_failure(self, monkeypatch):
        cache = feeds.Feeds()
        url = "https://x.test/d"
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: FEED)
        assert cache.read([url])[url][0] == "ok"
        cache._good[url] = (-feeds.FRESH * 10, cache._good[url][1])
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: b"<html>")
        assert cache.read([url])[url][0] == "ok"


class TestKeepingUpToDate:
    URL = "https://x.test/upkeep"
    NEWER = b"BEGIN:VCALENDAR\nVERSION:2.0\nX-NEWER:yes\nEND:VCALENDAR\n"

    @pytest.fixture
    def cache(self, monkeypatch):
        cache = feeds.Feeds()
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: FEED)
        cache.read([self.URL])
        return cache

    def age(self, cache, seconds):
        when, calendar = cache._good[self.URL]
        cache._good[self.URL] = (when - seconds, calendar)

    def test_first_visitor_after_a_quiet_week_gets_the_new_copy(
        self, cache, monkeypatch
    ):
        self.age(cache, 7 * feeds.STALE)
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: self.NEWER)
        assert "X-NEWER" in cache.read([self.URL])[self.URL][1]

    def test_a_page_doesnt_wait_for_the_new_copy(self, cache, monkeypatch):
        self.age(cache, 2 * feeds.FRESH)
        monkeypatch.setattr(
            feeds.fetch, "fetch", lambda url: time.sleep(1) or self.NEWER
        )
        began = time.monotonic()
        loaded = cache.read([self.URL], may_wait=False)[self.URL][1]
        assert "X-NEWER" not in loaded
        assert time.monotonic() - began < 0.5

    def test_a_calendar_known_to_be_down_isnt_waited_for(self, cache, monkeypatch):
        self.age(cache, 2 * feeds.FRESH)
        cache._failed[self.URL] = time.monotonic() - 2 * feeds.RETRY
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: time.sleep(1) or FEED)
        began = time.monotonic()
        assert cache.read([self.URL])[self.URL][0] == "ok"
        assert time.monotonic() - began < 0.5

    def test_failing_for_days_is_stale(self, cache, monkeypatch):
        self.age(cache, 3 * feeds.STALE + 60)
        assert cache.days_stale(self.URL) == 0, "only quiet, until it fails"
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: b"<html>")
        cache.read([self.URL])
        assert cache.days_stale(self.URL) == 3

    def test_failing_for_an_hour_isnt(self, cache, monkeypatch):
        self.age(cache, 3600)
        monkeypatch.setattr(feeds.fetch, "fetch", lambda url: b"<html>")
        cache.read([self.URL])
        assert cache.days_stale(self.URL) == 0


def test_calendar_file():
    day = date(2026, 12, 16)
    entry = Entry(id="a", key="a", title="Holiday", start=day, end=day, all_day=True)
    body = ics.build_calendar([entry], "Events", "UTC", "example.org")
    (event,) = icalendar.Calendar.from_ical(body).walk("VEVENT")
    assert event.decoded("dtstart") == day
    assert event.decoded("dtend") == date(2026, 12, 17)
