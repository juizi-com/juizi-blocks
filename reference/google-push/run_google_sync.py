"""Copy calendars to Google, from cron.

    JUIZI_CALENDAR_GOOGLE=/path/to/settings.json \\
        zconsole run instance/etc/zope.conf <this file>

It reports what it would do. Add JUIZI_CALENDAR_WRITE=1 to do it.
JUIZI_CALENDAR_ALLOW_MASS_DELETE=1 lifts the mass-delete stop for one run.

settings.json, kept out of git and readable by the server's user only:

    {
      "service_account_file": "/path/to/key.json",
      "calendars": [{
        "site": "/Plone",
        "page": "events",
        "block": "<the calendar block's id>",
        "calendar": "<Google calendar id>",
        "public_url": "https://www.example.org"
      }]
    }
"""

from juizi.blocks.calendar import google
from zope.component.hooks import setSite

import json
import os
import requests
import sys


def run(
    app, settings: dict, write: bool, allow_mass_delete: bool, session=None
) -> bool:
    calendars = settings.get("calendars") or []
    targets = [entry["calendar"] for entry in calendars]
    if len(targets) != len(set(targets)):
        print("Each Google Calendar can only be fed by one block.")
        return False
    session = session or requests.Session()
    with open(settings["service_account_file"]) as key_file:
        token = google.access_token(json.load(key_file), session)
    all_fine = True
    for entry in calendars:
        name = f"{entry['site']}/{entry['page']}"
        try:
            site = app.unrestrictedTraverse(entry["site"].strip("/"))
            setSite(site)
            path = entry["page"].strip("/")
            page = site.unrestrictedTraverse(path) if path else site
            bodies, source, after, before = google.desired_events(
                page, entry["block"], entry["public_url"]
            )
            plan = google.sync(
                google.GoogleCalendar(entry["calendar"], token, session),
                bodies,
                source,
                after,
                before,
                write,
                allow_mass_delete,
            )
        except Exception as error:
            print(f"{name}: failed: {error}")
            all_fine = False
            continue
        if plan.problem:
            print(f"{name}: stopped. {plan.problem}")
            all_fine = False
            continue
        print(
            f"{name}: {'done' if write else 'dry run'}: "
            f"{len(plan.create)} to add, {len(plan.update)} to change, "
            f"{len(plan.delete)} to remove, {plan.unchanged} unchanged"
        )
    return all_fine


if __name__ == "__main__":
    settings_path = os.environ.get("JUIZI_CALENDAR_GOOGLE")
    if not settings_path:
        print("JUIZI_CALENDAR_GOOGLE isn't set: nothing to do.")
        sys.exit(0)
    with open(settings_path) as settings_file:
        google_settings = json.load(settings_file)
    fine = run(
        globals()["app"],
        google_settings,
        write=os.environ.get("JUIZI_CALENDAR_WRITE") == "1",
        allow_mass_delete=os.environ.get("JUIZI_CALENDAR_ALLOW_MASS_DELETE") == "1",
    )
    sys.exit(0 if fine else 1)
