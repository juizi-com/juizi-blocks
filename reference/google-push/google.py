"""One-way copy of a calendar block's events to a Google Calendar.

Off unless the server is configured for it (see ``run_google_sync.py``).
Editors can't point it anywhere: the target calendar is server settings.

What keeps someone else's calendar safe:
- only events carrying this block's private mark are ever changed or deleted;
- only what a visitor could see is sent;
- a run that would remove most of what it sent earlier stops instead;
- nothing is written unless the run is told to write.
"""

from dataclasses import dataclass
from dataclasses import field
from datetime import date
from datetime import datetime
from datetime import timedelta
from Products.CMFCore.utils import getToolByName
from urllib.parse import quote

import hashlib
import json
import pytz
import random
import time


API = "https://www.googleapis.com/calendar/v3"
TOKEN_URL = "https://oauth2.googleapis.com/token"  # noqa: S105
SCOPE = "https://www.googleapis.com/auth/calendar.events"
SOURCE = "juiziSource"
DIGEST = "juiziDigest"
DAYS_BACK = 7
DAYS_AHEAD = 365
# From this many removals, they may be half of what's there at most.
MASS_DELETE = 5


def short_hash(value: str, length: int) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def site_prefix(context) -> str:
    """How the ids of this site's copies begin. Google allows a-v and 0-9."""
    portal = getToolByName(context, "portal_url").getPortalObject()
    created = getattr(portal, "creation_date", "")
    path = "/".join(portal.getPhysicalPath())
    return "jb" + short_hash(f"{path}|{created}", 12)


def event_id(prefix: str, source: str, key: str) -> str:
    return prefix + short_hash(f"{source}|{key}", 32)


def event_body(entry, identifier: str, source: str, zone: str, link: str) -> dict:
    body = {
        "id": identifier,
        "status": "confirmed",
        "summary": entry.title,
        "description": "\n\n".join(filter(None, (entry.description, link))),
        "location": entry.location,
    }
    if entry.all_day:
        body["start"] = {"date": entry.start.isoformat()}
        body["end"] = {"date": (entry.end + timedelta(days=1)).isoformat()}
    else:
        tz = pytz.timezone(zone)
        body["start"] = {
            "dateTime": entry.start.astimezone(tz).isoformat(),
            "timeZone": zone,
        }
        body["end"] = {
            "dateTime": max(entry.start, entry.end).astimezone(tz).isoformat(),
            "timeZone": zone,
        }
    digest = short_hash(json.dumps(body, sort_keys=True), 32)
    body["extendedProperties"] = {"private": {SOURCE: source, DIGEST: digest}}
    return body


def private_properties(event: dict) -> dict:
    return (event.get("extendedProperties") or {}).get("private") or {}


def starts_on(event: dict):
    start = event.get("start") or {}
    value = start.get("date") or start.get("dateTime") or ""
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


@dataclass
class Plan:
    create: list = field(default_factory=list)
    update: list = field(default_factory=list)
    delete: list = field(default_factory=list)
    unchanged: int = 0
    problem: str = ""


def make_plan(
    desired: list,
    existing: list,
    source: str,
    after: date,
    before: date,
    allow_mass_delete: bool = False,
) -> Plan:
    ours = {
        event["id"]: event
        for event in existing
        if private_properties(event).get(SOURCE) == source
        and event.get("status") != "cancelled"
    }
    plan = Plan()
    wanted = set()
    for body in desired:
        wanted.add(body["id"])
        current = ours.get(body["id"])
        if current is None:
            plan.create.append(body)
        elif (
            private_properties(current).get(DIGEST) != private_properties(body)[DIGEST]
        ):
            plan.update.append(body)
        else:
            plan.unchanged += 1
    inside = []
    for identifier, event in ours.items():
        day = starts_on(event)
        # A day in from each edge, where time zones blur what "inside" is.
        if day and after + timedelta(days=1) < day < before - timedelta(days=1):
            inside.append(identifier)
            if identifier not in wanted:
                plan.delete.append(identifier)
    removals = len(plan.delete)
    if not allow_mass_delete and removals:
        emptied = not desired and removals > 1
        most = removals >= MASS_DELETE and removals * 2 > len(inside)
        if emptied or most:
            plan.problem = (
                f"This would remove {removals} of the {len(inside)} events sent "
                "earlier, so nothing was changed. Allow a mass delete if that's right."
            )
    return plan


class GoogleError(Exception):
    def __init__(self, status: int, reason: str = ""):
        super().__init__(f"Google answered {status} {reason}".strip())
        self.status = status
        self.reason = reason


def error_reason(response) -> str:
    try:
        error = response.json()["error"]
        if isinstance(error, str):
            return error
        details = error.get("errors") or [{}]
        return details[0].get("reason") or error.get("status") or ""
    except (ValueError, KeyError, TypeError, AttributeError):
        return ""


class GoogleCalendar:
    """Just the four calls the copy needs."""

    def __init__(self, calendar_id, token, session, sleep=time.sleep):
        self.base = f"{API}/calendars/{quote(calendar_id, safe='')}/events"
        self.token = token
        self.session = session
        self.sleep = sleep

    def call(self, method: str, suffix: str = "", **kwargs) -> dict:
        for attempt in range(5):
            response = self.session.request(
                method,
                self.base + suffix,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=20,
                **kwargs,
            )
            if response.status_code < 400:
                return response.json() if response.content else {}
            reason = error_reason(response)
            retry = (
                response.status_code == 429
                or response.status_code >= 500
                or (response.status_code == 403 and "ateLimitExceeded" in reason)
            )
            if not retry or attempt == 4:
                raise GoogleError(response.status_code, reason)
            self.sleep(2**attempt + random.random())  # noqa: S311
        return {}

    def ours(self, source: str, after: date, before: date) -> list:
        params = {
            "privateExtendedProperty": f"{SOURCE}={source}",
            "timeMin": f"{after.isoformat()}T00:00:00Z",
            "timeMax": f"{before.isoformat()}T23:59:59Z",
            "maxResults": 2500,
        }
        found = []
        while True:
            page = self.call("GET", params=params)
            found.extend(page.get("items", []))
            if not page.get("nextPageToken"):
                return found
            params = {**params, "pageToken": page["nextPageToken"]}

    def create(self, body: dict, source: str) -> None:
        try:
            self.call("POST", json=body)
        except GoogleError as error:
            if error.status != 409:
                raise
            # Ours from before: moved into range, or deleted in Google, which
            # keeps the id. Anything else is left alone.
            current = self.call("GET", f"/{body['id']}")
            if private_properties(current).get(SOURCE) != source:
                raise
            self.update(body)

    def update(self, body: dict) -> None:
        self.call("PUT", f"/{body['id']}", json=body)

    def delete(self, identifier: str) -> None:
        try:
            self.call("DELETE", f"/{identifier}")
        except GoogleError as error:
            if error.status not in (404, 410):
                raise


def sync(
    client,
    desired: list,
    source: str,
    after: date,
    before: date,
    write: bool = False,
    allow_mass_delete: bool = False,
) -> Plan:
    plan = make_plan(
        desired,
        client.ours(source, after, before),
        source,
        after,
        before,
        allow_mass_delete,
    )
    if write and not plan.problem:
        for body in plan.create:
            client.create(body, source)
        for body in plan.update:
            client.update(body)
        for identifier in plan.delete:
            client.delete(identifier)
    return plan


def access_token(account: dict, session, now=None) -> str:
    """Sign in as the service account (needs ``juizi.blocks[google]``)."""
    import jwt

    issued = int(now or time.time())
    assertion = jwt.encode(
        {
            "iss": account["client_email"],
            "scope": SCOPE,
            # Fixed, whatever the key file says.
            "aud": TOKEN_URL,
            "iat": issued,
            "exp": issued + 3600,
        },
        account["private_key"],
        algorithm="RS256",
        headers={"kid": account.get("private_key_id", "")},
    )
    response = session.post(
        TOKEN_URL,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        },
        timeout=20,
    )
    if response.status_code != 200:
        raise GoogleError(response.status_code, error_reason(response))
    return response.json()["access_token"]


def desired_events(page, block_id: str, public_url: str, today=None) -> tuple:
    """What should be in Google, as a visitor would see it.

    Returns (bodies, source, first day, last day).
    """
    from AccessControl import getSecurityManager
    from AccessControl.SecurityManagement import newSecurityManager
    from AccessControl.SecurityManagement import setSecurityManager
    from AccessControl.users import nobody
    from juizi.blocks.calendar.events import local_entries
    from juizi.blocks.calendar.options import find_block
    from juizi.blocks.calendar.options import read_options

    previous = getSecurityManager()
    try:
        newSecurityManager(None, nobody)
        if not getSecurityManager().checkPermission("View", page):
            raise ValueError("The page with the calendar isn't published.")
        block = find_block(getattr(page, "blocks", None), block_id)
        if block is None:
            raise ValueError("There's no calendar block with that id on the page.")
        options = read_options(page, block)
        today = today or datetime.now(options.tz).date()
        after = today - timedelta(days=DAYS_BACK)
        before = today + timedelta(days=DAYS_AHEAD)
        entries = local_entries(page, options, after, before)
    finally:
        setSecurityManager(previous)

    source = short_hash(f"{page.UID()}|{block_id}", 32)
    prefix = site_prefix(page)
    root = "/".join(
        getToolByName(page, "portal_url").getPortalObject().getPhysicalPath()
    )
    bodies = []
    for entry in entries:
        link = public_url.rstrip("/") + entry.path[len(root) :] if entry.path else ""
        identifier = event_id(prefix, source, entry.key)
        bodies.append(event_body(entry, identifier, source, options.timezone, link))
    return bodies, source, after, before
