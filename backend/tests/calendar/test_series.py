"""Series as people save them: inside themselves, and day after day."""

from datetime import date
from datetime import datetime
from datetime import timedelta
from juizi.blocks.calendar.data import in_editors_order
from juizi.blocks.calendar.entry import Entry
from juizi.blocks.calendar.events import mend_series
from juizi.blocks.calendar.events import occurrence_spans

import pytest
import pytz


def info(rule, whole_day=False):
    return {"recurrence": rule, "whole_day": whole_day}


def test_dates_that_repeat_inside_themselves_are_one_event():
    rule = "RRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20261204T000000Z"
    start, days = datetime(2026, 11, 30), timedelta(days=4)
    assert mend_series(start, days, info(rule, True)) == ("", days)


def test_times_that_repeat_inside_themselves_are_sessions():
    rule = "RRULE:FREQ=DAILY;COUNT=5"
    start = datetime(2026, 10, 19, 7)
    found = mend_series(start, timedelta(days=4, hours=4), info(rule))
    assert found == (rule, timedelta(hours=4))


def test_weekly_dates_inside_themselves_stay_weekly():
    rule = "RRULE:FREQ=WEEKLY;COUNT=3"
    found = mend_series(datetime(2026, 11, 2), timedelta(days=14), info(rule, True))
    assert found == (rule, timedelta(0))


@pytest.mark.parametrize(
    "rule",
    ["RRULE:FREQ=WEEKLY;COUNT=10", "RRULE:FREQ=WEEKLY", ""],
)
def test_an_ordinary_long_event_is_left_alone(rule):
    days = timedelta(days=2)
    found = mend_series(datetime(2026, 11, 2, 9), days, info(rule))
    assert found == (rule, days)


def spans(rule, runs=True, month=11):
    return occurrence_spans(
        datetime(2026, 10, 28, 9),
        timedelta(hours=4),
        rule,
        date(2026, month, 1),
        date(2026, month, 28),
        runs,
    )


def test_days_in_a_row_are_one_long_event_whole_across_the_edge():
    (span,) = spans("RRULE:FREQ=DAILY;COUNT=8")
    assert span == (datetime(2026, 10, 28, 9), datetime(2026, 11, 4, 9), True)


def test_a_weekend_off_splits_the_run():
    rule = "RRULE:FREQ=DAILY;COUNT=12\nEXDATE:20261031T090000,20261101T090000"
    # Three days before the weekend keep their days, the week after is a bar.
    assert [(a.day, b.day) for a, b, joined in spans(rule) if joined] == [(2, 8)]


def test_three_days_and_endless_series_keep_their_days():
    assert not any(joined for *_, joined in spans("RRULE:FREQ=DAILY;COUNT=3"))
    assert not any(joined for *_, joined in spans("RRULE:FREQ=DAILY"))


def test_subscribe_file_keeps_each_day():
    assert not any(joined for *_, joined in spans("RRULE:FREQ=DAILY;COUNT=8", False))


def test_at_the_same_time_the_editors_order_decides():
    tz = pytz.utc
    at = tz.localize(datetime(2026, 11, 3, 10))
    later = at + timedelta(hours=1)
    entries = [
        Entry(id="a", title="A", start=at, end=later, types=["talk"]),
        Entry(id="z", title="Z", start=at, end=later, types=["keynote"]),
        Entry(id="b", title="B", start=later, end=later, types=["keynote"]),
    ]
    kinds = [{"id": "keynote"}, {"id": "talk"}]
    found = in_editors_order(entries, kinds, tz)
    assert [entry.id for entry in found] == ["z", "a", "b"]
