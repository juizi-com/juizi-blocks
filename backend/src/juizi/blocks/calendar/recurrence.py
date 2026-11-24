"""Occurrences of a repeating event inside a range of days.

Follows plone.event's reading of the rules Plone's editor saves (times in
EXDATE and RDATE take the event's, UNTIL includes its whole day), but isn't
limited to the first 1,000 occurrences.
"""

from datetime import datetime
from datetime import timedelta
from dateutil import rrule
from functools import lru_cache

import logging
import re


logger = logging.getLogger("juizi.blocks")

# A daily event for 100 years.
MAX_STEPS = 36600
TOO_OFTEN = re.compile(r"FREQ=(SECONDLY|MINUTELY|HOURLY)", re.I)


def normalise(rule: str, start: datetime) -> str:
    at = start.strftime("T%H%M%S")
    rule = rule.replace("\r", "").strip()
    rule = re.sub(r"DTSTART[^\n]*(\n|$)", "", rule)
    if at != "T000000":
        rule = rule.replace("T000000", at)
    rule = re.sub(r"(UNTIL=\d{8})T\d{6}", r"\1T235959", rule)
    rule = re.sub(r"UNTIL=(\d{8})(?![T\d])", r"UNTIL=\1T235959", rule)
    return re.sub(
        r"EXDATE[^\n]*",
        lambda found: re.sub(r"T\d{6}", at, found.group(0)),
        rule,
    )


def ends(rule: str) -> bool:
    """Whether the series stops."""
    return "RRULE" not in rule or bool(re.search(r"(COUNT|UNTIL)=", rule))


def inside_itself(start: datetime, end: datetime, rule: str) -> tuple:
    """A series' starts when every one falls before the first one's end.

    Editors fill in an event's first and last day, then also make it repeat
    over those days. Read as saved, that is several events on top of each
    other; they mean either those days' sessions or the one long event.
    """
    if not rule or end.date() <= start.date() or not ends(rule):
        return ()
    found = occurrence_starts(
        start, rule, start, end + timedelta(days=800), timedelta(0)
    )
    if len(found) < 2 or found[-1].date() > end.date():
        return ()
    return found


def day_runs(starts) -> list:
    """Starts split into runs of days that follow each other."""
    runs = []
    for value in starts:
        if runs and value - runs[-1][-1] == timedelta(days=1):
            runs[-1].append(value)
        else:
            runs.append([value])
    return runs


@lru_cache(maxsize=4096)
def occurrence_starts(
    start: datetime,
    rule: str,
    after: datetime,
    before: datetime,
    duration: timedelta,
) -> tuple:
    """Clock-time starts (naive, in the event's zone) of the occurrences
    that overlap ``after``..``before``."""
    earliest = after - duration
    single = (start,) if earliest <= start <= before else ()
    if not rule:
        return single
    if TOO_OFTEN.search(rule):
        logger.warning("Calendar: repeat rule more often than daily: %r", rule)
        return single
    try:
        rules = rrule.rrulestr(
            normalise(rule, start), dtstart=start, forceset=True, ignoretz=True
        )
        rules.rdate(start)
        found = []
        for step, value in enumerate(rules):
            if step >= MAX_STEPS or value > before:
                break
            if value >= earliest:
                found.append(value)
        return tuple(found)
    except (ValueError, TypeError):
        logger.warning("Calendar: unreadable repeat rule: %r", rule)
        return single
