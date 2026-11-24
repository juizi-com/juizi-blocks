"""The copy to Google, against a pretend Google."""

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import date
from datetime import timedelta
from juizi.blocks.calendar import google
from juizi.blocks.calendar.entry import Entry

import copy
import jwt
import pytest
import re


AFTER, BEFORE = date(2026, 11, 1), date(2027, 11, 1)
SOURCE = "source-a"
PREFIX = "jb0123456789ab"


class Response:
    def __init__(self, status, body=None):
        self.status_code = status
        self.body = body
        self.content = b"x" if body is not None else b""

    def json(self):
        return self.body


class FakeGoogle:
    def __init__(self):
        self.events = {}
        self.calls = []
        self.answers = []

    def request(self, method, url, headers, timeout, params=None, json=None):
        self.calls.append(method)
        assert headers["Authorization"] == "Bearer token"
        assert "/calendars/team%40group.calendar.google.com/events" in url
        if self.answers:
            return self.answers.pop(0)
        identifier = url.split("/events", 1)[1].strip("/")
        if method == "GET" and not identifier:
            name, value = params["privateExtendedProperty"].split("=")
            items = [
                event
                for event in self.events.values()
                if event.get("status") != "cancelled"
                and google.private_properties(event).get(name) == value
            ]
            return Response(200, {"items": copy.deepcopy(items)})
        if method == "POST":
            if json["id"] in self.events:
                return Response(409, {"error": {"errors": [{"reason": "duplicate"}]}})
            self.events[json["id"]] = copy.deepcopy(json)
            return Response(200, json)
        if identifier not in self.events:
            return Response(404, {"error": {}})
        if method == "PUT":
            self.events[identifier] = copy.deepcopy(json)
        elif method == "DELETE":
            self.events[identifier]["status"] = "cancelled"
            return Response(204)
        return Response(200, self.events[identifier])


@pytest.fixture
def fake():
    return FakeGoogle()


@pytest.fixture
def client(fake):
    return google.GoogleCalendar(
        "team@group.calendar.google.com", "token", fake, sleep=lambda seconds: None
    )


def body(key, day=10, title=None, source=SOURCE):
    start = date(2026, 12, 1) + timedelta(days=day)
    entry = Entry(id=key, title=title or key, start=start, end=start, all_day=True)
    identifier = google.event_id(PREFIX, source, key)
    return google.event_body(entry, identifier, source, "UTC", "")


def run(client, desired, **kwargs):
    return google.sync(client, desired, SOURCE, AFTER, BEFORE, **kwargs)


def test_ids_are_ones_google_accepts():
    assert re.fullmatch(r"[a-v0-9]{5,1024}", google.event_id(PREFIX, SOURCE, "key"))


def test_dry_run_writes_nothing(fake, client):
    assert len(run(client, [body("a"), body("b")]).create) == 2
    assert fake.calls == ["GET"]


def test_second_run_changes_nothing(fake, client):
    run(client, [body("a")], write=True)
    plan = run(client, [body("a")], write=True)
    assert (plan.create, plan.update, plan.delete, plan.unchanged) == ([], [], [], 1)


def test_change_and_removal(fake, client):
    run(client, [body("a"), body("b"), body("c")], write=True)
    plan = run(client, [body("a", title="Renamed"), body("b")], write=True)
    assert (len(plan.update), len(plan.delete)) == (1, 1)
    assert fake.events[body("a")["id"]]["summary"] == "Renamed"
    assert fake.events[body("c")["id"]]["status"] == "cancelled"


def test_events_that_arent_ours_are_never_touched(fake, client):
    fake.events["theirs"] = {"id": "theirs", "start": {"date": "2026-12-12"}}
    fake.events["other"] = body("x", source="source-b")
    before = copy.deepcopy(fake.events)
    run(client, [], write=True, allow_mass_delete=True)
    assert fake.events == before


def test_someone_elses_event_with_our_id_is_left_alone(fake, client):
    taken = {**body("a"), "extendedProperties": {}}
    fake.events[taken["id"]] = taken
    with pytest.raises(google.GoogleError):
        run(client, [body("a")], write=True)
    assert fake.events[taken["id"]] == taken


def test_deleted_in_google_comes_back(fake, client):
    run(client, [body("a")], write=True)
    fake.events[body("a")["id"]]["status"] = "cancelled"
    run(client, [body("a")], write=True)
    assert fake.events[body("a")["id"]]["status"] == "confirmed"


@pytest.mark.parametrize(("sent", "kept"), [(3, 0), (12, 4)])
def test_mass_delete_stops(fake, client, sent, kept):
    run(client, [body(str(n), day=n) for n in range(sent)], write=True)
    before = copy.deepcopy(fake.events)
    plan = run(client, [body(str(n), day=n) for n in range(kept)], write=True)
    assert plan.problem
    assert fake.events == before


def test_past_events_outside_the_window_stay(fake, client):
    old = body("old")
    old["start"] = {"date": "2026-10-01"}
    fake.events[old["id"]] = old
    assert run(client, [], write=True).delete == []


def test_rate_limit_is_retried(fake, client):
    limited = {"error": {"errors": [{"reason": "rateLimitExceeded"}]}}
    fake.answers = [Response(403, limited), Response(429, {})]
    run(client, [])
    assert fake.calls == ["GET"] * 3


def test_no_permission_isnt_retried(fake, client):
    fake.answers = [Response(403, {"error": {"errors": [{"reason": "forbidden"}]}})]
    with pytest.raises(google.GoogleError):
        run(client, [])
    assert fake.calls == ["GET"]


def test_sign_in_asks_only_google_for_the_narrow_scope():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pem = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    sent = {}

    class Session:
        def post(self, url, data, timeout):
            sent.update(data, url=url)
            return Response(200, {"access_token": "token"})

    account = {
        "client_email": "sync@project.iam.gserviceaccount.com",
        "private_key": pem,
        "token_uri": "https://attacker.example/token",
    }
    assert google.access_token(account, Session()) == "token"
    assert sent["url"] == google.TOKEN_URL
    claims = jwt.decode(
        sent["assertion"], key.public_key(), ["RS256"], audience=google.TOKEN_URL
    )
    assert claims["scope"] == google.SCOPE
