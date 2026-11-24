"""/<page>/@@juizi-calendar.ics?block=<id>: the calendar, to subscribe to.

This site's events only: other people's calendars aren't republished.
Repeats are written out, so every calendar app shows the dates the block
shows.
"""

from datetime import date
from datetime import datetime
from datetime import timedelta
from juizi.blocks.calendar.events import local_entries
from juizi.blocks.calendar.options import find_block
from juizi.blocks.calendar.options import read_options
from Products.Five.browser import BrowserView
from zExceptions import NotFound

import icalendar
import pytz


DAYS_BACK = 92
DAYS_AHEAD = 548


def build_calendar(entries, name: str, zone: str, host: str) -> bytes:
    calendar = icalendar.Calendar()
    calendar.add("prodid", "-//Juizi//Events calendar//EN")
    calendar.add("version", "2.0")
    calendar.add("method", "PUBLISH")
    calendar.add("x-wr-calname", name)
    calendar.add("x-wr-timezone", zone)
    stamp = datetime.now(pytz.utc).replace(microsecond=0)
    for entry in entries:
        event = icalendar.Event()
        event.add("uid", f"{entry.key}@{host}")
        event.add("dtstamp", stamp)
        event.add("summary", entry.title)
        if entry.all_day:
            event.add("dtstart", entry.start)
            event.add("dtend", entry.end + timedelta(days=1))
        else:
            event.add("dtstart", entry.start.astimezone(pytz.utc))
            if entry.end > entry.start:
                event.add("dtend", entry.end.astimezone(pytz.utc))
        if entry.description:
            event.add("description", entry.description)
        if entry.location:
            event.add("location", entry.location)
        if entry.url:
            event.add("url", entry.url.replace("/++api++", ""))
        calendar.add_component(event)
    return calendar.to_ical()


class CalendarFile(BrowserView):
    def __call__(self):
        block_id = self.request.form.get("block")
        block = None
        if isinstance(block_id, str):
            block = find_block(getattr(self.context, "blocks", None), block_id)
        if not block or not block.get("showSubscribe"):
            raise NotFound(self.context, "juizi-calendar.ics", self.request)
        options = read_options(self.context, block)
        today = date.today()
        entries = local_entries(
            self.context,
            options,
            today - timedelta(days=DAYS_BACK),
            today + timedelta(days=DAYS_AHEAD),
        )
        title = block.get("title") or self.context.Title()
        host = self.request.get("HTTP_HOST") or "calendar"
        response = self.request.response
        response.setHeader("Content-Type", "text/calendar; charset=utf-8")
        response.setHeader("Content-Disposition", 'inline; filename="calendar.ics"')
        response.setHeader("X-Robots-Tag", "noindex")
        return build_calendar(entries, str(title), options.timezone, host)
