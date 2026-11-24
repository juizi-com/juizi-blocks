"""One thing on the calendar, from this site or from a feed."""

from dataclasses import dataclass
from dataclasses import field
from datetime import date
from datetime import datetime
from datetime import time
from datetime import timedelta


@dataclass
class Entry:
    id: str
    title: str
    start: object  # a date when all day, else an aware datetime
    end: object  # the last day when all day, else an aware datetime
    all_day: bool = False
    open_end: bool = False
    url: str = ""
    path: str = ""
    description: str = ""
    location: str = ""
    language: str = ""
    types: list = field(default_factory=list)
    # Stays the same when a one-off event moves: the subscribe file's UID.
    key: str = ""
    # Several days of the same hours, drawn as one long event.
    daily: bool = False

    def days(self, tz) -> tuple:
        """First and last day it is on, in ``tz``. All-day never shifts."""
        if self.all_day:
            return self.start, max(self.start, self.end)
        start = self.start.astimezone(tz)
        end = self.end.astimezone(tz)
        first, last = start.date(), end.date()
        if last > first and end.time() == time(0):
            last -= timedelta(days=1)  # until midnight isn't on the next day
        return first, max(first, last)

    def overlaps(self, tz, after: date, before: date) -> bool:
        first, last = self.days(tz)
        return first <= before and last >= after

    def order(self, tz, rank: int = 0) -> tuple:
        """By day and time. At the same time, as the editor ordered the types."""
        first, last = self.days(tz)
        timed = not self.all_day
        at = self.start.astimezone(tz).time() if timed else time(0)
        return first, timed, at, -(last - first).days, rank, self.title.lower(), self.id

    def as_json(self, tz) -> dict:
        first, last = self.days(tz)
        result = {
            "id": self.id,
            "title": self.title,
            "start": first.isoformat(),
            "end": last.isoformat(),
            "allDay": self.all_day,
            "daily": self.daily,
            "openEnd": self.open_end,
            "startTime": "",
            "endTime": "",
            "startISO": first.isoformat(),
            "endISO": last.isoformat(),
            "url": self.url,
            "description": self.description,
            "location": self.location,
            "language": self.language,
            "types": self.types,
        }
        if not self.all_day:
            start: datetime = self.start.astimezone(tz)
            end: datetime = self.end.astimezone(tz)
            result["startTime"] = start.strftime("%H:%M")
            result["startISO"] = start.isoformat()
            result["endISO"] = end.isoformat()
            if not self.open_end and end > start:
                result["endTime"] = end.strftime("%H:%M")
        return result
