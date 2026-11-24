"""The calendar on a site: what visitors get, and what they can't."""

from datetime import datetime
from juizi.blocks.calendar import feeds
from juizi.blocks.calendar import setup
from juizi.blocks.calendar import siteconfig
from juizi.blocks.calendar.behavior import BEHAVIOR
from juizi.blocks.calendar.options import read_options
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.app.testing import TEST_USER_ID
from plone.restapi.testing import RelativeSession

import icalendar
import json
import pytest
import pytz
import transaction


TZ = pytz.timezone("Africa/Johannesburg")
SECRET = "private-0f3a9c1b7e"  # noqa: S105
LINK = f"https://calendar.google.com/calendar/ical/x/{SECRET}/basic.ics"


def publish(obj):
    if api.content.get_state(obj, default="published") != "published":
        api.content.transition(obj=obj, to_state="published")


def event(portal, name, start, end, public=True, zone=TZ, **fields):
    obj = api.content.create(
        container=portal,
        type="Event",
        id=name,
        title=name,
        start=zone.localize(datetime(*start)),
        end=zone.localize(datetime(*end)),
        **fields,
    )
    if public:
        publish(obj)
    obj.reindexObject()
    return obj


BLOCK = {
    "@type": "juiziCalendar",
    "items": [
        {"@id": "sport", "source": "tags", "tags": ["Sport"]},
        {"@id": "both", "source": "tags", "tags": ["Music", "Juniors"], "match": "all"},
        {"@id": "any", "source": "tags", "tags": ["Music", "Juniors"], "match": "any"},
    ],
}


@pytest.fixture
def site(functional):
    portal = functional["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    api.portal.set_registry_record("plone.portal_timezone", "Africa/Johannesburg")
    switch_on()
    siteconfig.save({"taxonomies": [], "feeds": True})
    feeds.feeds.clear()
    portal.portal_workflow.setChainForPortalTypes(
        ["Document", "Event"], "simple_publication_workflow"
    )
    event(portal, "match", (2026, 11, 4, 14), (2026, 11, 4, 16), subject=("Sport",))
    event(portal, "music", (2026, 11, 5, 9), (2026, 11, 5, 10), subject=("Music",))
    event(
        portal,
        "junior-choir",
        (2026, 11, 6, 9),
        (2026, 11, 6, 10),
        subject=("Music", "Juniors"),
    )
    event(portal, "untagged", (2026, 11, 7, 9), (2026, 11, 7, 10))
    event(portal, "draft", (2026, 11, 8, 9), (2026, 11, 8, 10), public=False)
    event(portal, "exams", (2026, 10, 21, 0), (2026, 11, 27, 23, 59), whole_day=True)
    event(portal, "term", (2026, 9, 1, 8), (2027, 2, 1, 9))
    event(
        portal,
        "club",
        (2026, 3, 4, 15),
        (2026, 3, 4, 16),
        recurrence="RRULE:FREQ=WEEKLY",
    )
    event(
        portal,
        "breakfast",
        (2026, 3, 27, 9),
        (2026, 3, 27, 10),
        zone=pytz.timezone("Europe/Berlin"),
        recurrence="RRULE:FREQ=DAILY;COUNT=5",
    )
    holiday = event(portal, "holiday", (2026, 11, 9, 0), (2026, 11, 9, 23, 59))
    holiday.whole_day = True
    holiday.calendar_entry_only = True
    holiday.reindexObject()

    page = api.content.create(container=portal, type="Document", id="calendar-page")
    page.blocks = {"cal": dict(BLOCK)}
    page.blocks_layout = {"items": ["cal"]}
    publish(page)
    transaction.commit()
    return portal


@pytest.fixture
def sessions(functional):
    made = []

    def make(auth=None):
        session = RelativeSession(functional["portal"].absolute_url())
        session.headers.update({"Accept": "application/json"})
        session.auth = auth
        made.append(session)
        return session

    yield make
    for session in made:
        session.close()


@pytest.fixture
def anonymous(site, sessions):
    return sessions()


@pytest.fixture
def manager(site, sessions):
    return sessions((SITE_OWNER_NAME, SITE_OWNER_PASSWORD))


def get_month(session, month="2026-11", block="cal"):
    response = session.get(
        f"/calendar-page/@juizi-calendar?block={block}&month={month}"
    )
    assert response.status_code == 200, response.text
    return response.json()


def named(month, title):
    return [found for found in month["events"] if found["title"] == title]


def save_block(manager, **changes):
    blocks = {"cal": {**BLOCK, **changes}}
    response = manager.patch("/calendar-page", json={"blocks": blocks})
    assert response.status_code == 204, response.text
    transaction.begin()


def switch_on():
    """As the dashboard does when the site owner switches the block on."""
    api.portal.set_registry_record("juizi.blocks.enabled_blocks", ["juiziCalendar"])
    setup.activate()


def test_events_get_the_tick_box(site):
    assert BEHAVIOR in site.portal_types.Event.behaviors


class TestSwitchingOn:
    """A site that doesn't use the calendar is left alone."""

    def test_installing_leaves_events_alone(self, functional):
        portal = functional["portal"]
        assert BEHAVIOR not in portal.portal_types.Event.behaviors
        setup.install()
        assert BEHAVIOR not in portal.portal_types.Event.behaviors

    def test_an_upgrade_sets_up_a_site_already_using_it(self, functional):
        portal = functional["portal"]
        api.portal.set_registry_record("juizi.blocks.enabled_blocks", ["juiziCalendar"])
        setup.install()
        assert BEHAVIOR in portal.portal_types.Event.behaviors

    def test_switching_it_on_in_the_dashboard(self, functional, sessions):
        portal = functional["portal"]
        setRoles(portal, TEST_USER_ID, ["Manager"])
        api.content.create(
            container=portal,
            type="Event",
            id="before",
            title="Before",
            start=datetime(2026, 11, 4, 14),
            end=datetime(2026, 11, 4, 16),
        )
        transaction.commit()
        # As an event from before the index existed: not in it.
        catalog = portal.portal_catalog
        (brain,) = catalog(id="before")
        catalog._catalog.getIndex("juizi_event_kind").unindex_object(brain.getRID())
        assert not catalog.getIndexDataForRID(brain.getRID()).get("juizi_event_kind")
        transaction.commit()

        manager = sessions((SITE_OWNER_NAME, SITE_OWNER_PASSWORD))
        response = manager.patch(
            "/@juizi-blocks-settings", json={"enabled_blocks": ["juiziCalendar"]}
        )
        assert response.status_code == 200, response.text
        transaction.begin()
        assert BEHAVIOR in portal.portal_types.Event.behaviors
        (brain,) = catalog(id="before")
        assert catalog.getIndexDataForRID(brain.getRID()).get("juizi_event_kind")

    def test_other_settings_dont_set_it_up(self, functional, sessions):
        portal = functional["portal"]
        manager = sessions((SITE_OWNER_NAME, SITE_OWNER_PASSWORD))
        response = manager.patch(
            "/@juizi-blocks-settings", json={"disabled_blocks": ["juiziHero"]}
        )
        assert response.status_code == 200, response.text
        transaction.begin()
        assert BEHAVIOR not in portal.portal_types.Event.behaviors

    def test_is_on(self):
        assert setup.is_on([], ["juiziCalendar"])
        assert not setup.is_on([], [])
        assert not setup.is_on(["juiziCalendar"], ["juiziCalendar"])
        assert not setup.is_on(None, None)


def test_any_all_order_and_other(anonymous):
    month = get_month(anonymous)
    assert named(month, "match")[0]["types"] == ["sport"]
    assert named(month, "music")[0]["types"] == ["any"]
    assert named(month, "junior-choir")[0]["types"] == ["both", "any"]
    assert named(month, "untagged")[0]["types"] == ["_other"]
    assert [found["label"] for found in month["types"]][:2] == [
        "Sport",
        "Music, Juniors",
    ]


def test_other_events_can_be_switched_off(manager, anonymous):
    save_block(manager, showOther=False)
    month = get_month(anonymous)
    assert not named(month, "untagged")
    assert named(month, "match")


def test_drafts_stay_private(manager, anonymous):
    assert not named(get_month(anonymous), "draft")
    assert named(get_month(manager), "draft")


def test_events_across_month_edges(anonymous):
    month = get_month(anonymous)
    exams = named(month, "exams")[0]
    assert (exams["start"], exams["end"]) == ("2026-10-21", "2026-11-27")
    assert exams["allDay"] and not exams["startTime"]
    # Starts before the month and ends after it.
    assert named(month, "term")


def test_series_keeps_its_past_months(anonymous):
    april = [found["start"] for found in named(get_month(anonymous, "2026-04"), "club")]
    assert "2026-04-01" in april
    assert len(named(get_month(anonymous, "2029-11"), "club")) >= 4


def test_series_keeps_its_clock_time_over_dst(manager, anonymous):
    save_block(manager, timezone="Europe/Berlin")
    (found,) = named(get_month(anonymous, "2026-03"), "breakfast")
    # Five days in a row are one long event on a month, with their hours.
    assert (found["start"], found["end"]) == ("2026-03-27", "2026-03-31")
    assert (found["startTime"], found["endTime"]) == ("09:00", "10:00")
    assert found["daily"]
    assert found["startISO"][-6:] != found["endISO"][-6:]  # two offsets


def test_block_zone_moves_times_but_not_all_day(manager, anonymous):
    save_block(manager, timezone="America/Los_Angeles")
    month = get_month(anonymous)
    assert named(month, "match")[0]["startTime"] == "04:00"
    assert named(month, "exams")[0]["start"] == "2026-10-21"
    assert month["timezoneDiffers"]


def test_entry_only_has_no_link(anonymous):
    month = get_month(anonymous)
    assert named(month, "holiday")[0]["url"] == ""
    assert named(month, "match")[0]["url"].endswith("/match")


def test_empty_month_points_to_the_next_event(manager, anonymous):
    save_block(manager, showOther=False)
    month = get_month(anonymous, "2026-08")
    assert month["events"] == []
    assert month["next"] == "2026-11-04"


def test_bad_requests(anonymous):
    base = "/calendar-page/@juizi-calendar"
    assert anonymous.get(f"{base}?block=nope").status_code == 404
    assert anonymous.get(f"{base}?block=cal&month=x").status_code == 400
    assert anonymous.post(base, json={"block": BLOCK}).status_code == 401
    assert anonymous.get("/calendar-page/@juizi-calendar-options").status_code == 401


def test_month_comes_with_the_page(anonymous):
    block = anonymous.get("/calendar-page").json()["blocks"]["cal"]
    assert "events" in block["calendarData"]


def test_month_is_never_saved(manager, site):
    save_block(manager, calendarData={"events": []})
    assert "calendarData" not in site["calendar-page"].blocks["cal"]


def test_private_link_never_reaches_anyone(manager, anonymous, site, monkeypatch):
    monkeypatch.setattr(
        feeds.fetch, "fetch", lambda url: b"BEGIN:VCALENDAR\nEND:VCALENDAR"
    )
    save_block(manager, items=[{"@id": "g", "source": "feed", "feed": LINK}])
    assert SECRET not in json.dumps(site["calendar-page"].blocks)
    for path in (
        "/calendar-page",
        "/calendar-page/@juizi-calendar?block=cal",
        "/@search?metadata_fields=blocks",
        "/@search?metadata_fields=_all",
    ):
        assert SECRET not in anonymous.get(path).text, path
        assert SECRET not in manager.get(path).text, path


def test_link_is_hidden_whatever_is_typed(manager, site):
    for feed in (LINK.replace("https://", ""), LINK.replace("https", "webcal")):
        save_block(manager, items=[{"@id": "g", "source": "tags", "feed": feed}])
        assert SECRET not in json.dumps(site["calendar-page"].blocks)


def test_link_in_a_nested_block_is_hidden(manager, site):
    inner = {**BLOCK, "items": [{"@id": "g", "source": "feed", "feed": LINK}]}
    blocks = {"grid": {"@type": "gridBlock", "blocks": {"cal": inner}}}
    assert manager.patch("/calendar-page", json={"blocks": blocks}).status_code == 204
    transaction.begin()
    assert SECRET not in json.dumps(site["calendar-page"].blocks)


def test_unsaved_link_works_only_in_the_editors_preview(
    manager, anonymous, site, monkeypatch
):
    fetched = []
    monkeypatch.setattr(
        feeds.fetch,
        "fetch",
        lambda url: fetched.append(url) or b"BEGIN:VCALENDAR\nEND:VCALENDAR",
    )
    block = {**BLOCK, "items": [{"@id": "g", "source": "feed", "feed": LINK}]}
    site["calendar-page"].blocks = {"cal": block}  # saved around the REST API
    transaction.commit()
    assert get_month(anonymous)["failed"] == ["g"]
    assert fetched == []
    response = manager.post("/calendar-page/@juizi-calendar", json={"block": block})
    assert response.json()["failed"] == []
    assert fetched == [LINK]


def test_failed_feed_is_reported(manager, anonymous, monkeypatch):
    monkeypatch.setattr(feeds.fetch, "fetch", lambda url: b"<html>")
    save_block(manager, items=[{"@id": "g", "source": "feed", "feed": LINK}])
    month = get_month(anonymous)
    assert month["failed"] == ["g"]
    assert named(month, "match"), "this site's events still show"


def test_only_editors_hear_of_a_stale_feed(manager, anonymous, monkeypatch):
    monkeypatch.setattr(feeds.fetch, "fetch", lambda url: b"<html>")
    monkeypatch.setattr(feeds.feeds, "days_stale", lambda url: 3)
    block = {**BLOCK, "items": [{"@id": "g", "source": "feed", "feed": LINK}]}
    preview = manager.post("/calendar-page/@juizi-calendar", json={"block": block})
    assert preview.json()["stale"] == [{"id": "g", "days": 3}]
    save_block(manager, items=block["items"])
    assert get_month(anonymous)["stale"] == []


def test_options_for_the_sidebar(manager):
    options = manager.get("/calendar-page/@juizi-calendar-options").json()
    assert {"Sport", "Music"} <= set(options["tags"])
    assert "Event" in [kind["id"] for kind in options["kinds"]]
    assert options["taxonomies"] == options["sessionLists"] == []
    assert options["feeds"] is True


def test_new_rules_say_what_and_filter_by(manager, anonymous):
    save_block(
        manager,
        items=[
            {"@id": "sport", "what": ["any"], "filterBy": "tags", "values": ["Sport"]},
            {"@id": "events", "what": ["Event"], "filterBy": "all"},
            {
                "@id": "pages",
                "what": ["Document"],
                "filterBy": "tags",
                "values": ["Sport"],
            },
        ],
    )
    month = get_month(anonymous)
    assert named(month, "match")[0]["types"] == ["sport", "events"]
    assert named(month, "untagged")[0]["types"] == ["events"]
    assert [found["id"] for found in month["types"]][:2] == ["sport", "events"]


def test_settings_are_for_the_site_owner(anonymous, manager):
    assert anonymous.get("/@juizi-calendar-settings").status_code == 401
    found = manager.get("/@juizi-calendar-settings").json()
    (event_kind,) = [kind for kind in found["kinds"] if kind["id"] == "Event"]
    assert event_kind["on"] is True
    assert event_kind["count"] >= 8
    assert found["feeds"] is True


def test_a_kind_switched_off_leaves_every_calendar(manager, anonymous):
    response = manager.patch("/@juizi-calendar-settings", json={"kinds": []})
    assert response.status_code == 200, response.text
    assert response.json()["kinds"][0]["on"] is False
    transaction.begin()
    assert get_month(anonymous)["events"] == []
    options = manager.get("/calendar-page/@juizi-calendar-options").json()
    assert options["kinds"] == []
    manager.patch("/@juizi-calendar-settings", json={"kinds": ["Event"]})
    transaction.begin()
    assert named(get_month(anonymous), "match")


def test_settings_refuse_what_the_site_has_not_got(manager):
    for body in (
        {"kinds": ["Document"]},
        {"taxonomies": [{"id": "taxonomy_nothing"}]},
        {"feeds": "yes"},
    ):
        response = manager.patch("/@juizi-calendar-settings", json=body)
        assert response.status_code == 400, body


def test_other_calendars_need_the_owners_say_so(site):
    page = site["calendar-page"]
    block = {"items": [{"@id": "x", "what": ["feed"], "feed": LINK}]}
    assert read_options(page, block).feed_items
    siteconfig.save({"taxonomies": [], "feeds": False})
    assert read_options(page, block).feed_items == []
    old = {"items": [{"@id": "x", "source": "feed", "feed": LINK}]}
    assert read_options(page, old).feed_items == []


def test_calendar_file(manager, anonymous):
    path = "/calendar-page/@@juizi-calendar.ics?block=cal"
    assert anonymous.get(path).status_code == 404
    save_block(manager, showSubscribe=True)
    response = anonymous.get(path)
    assert response.status_code == 200
    events = icalendar.Calendar.from_ical(response.content).walk("VEVENT")
    assert "draft" not in {str(found["SUMMARY"]) for found in events}


def test_taxonomy_index_any_and_all(site, manager, anonymous):
    catalog = site.portal_catalog
    catalog.addIndex("taxonomy_audience", "KeywordIndex")
    for name, terms in (("match", ["boys"]), ("junior-choir", ["boys", "parents"])):
        site[name].taxonomy_audience = terms
        site[name].reindexObject()
    transaction.commit()
    item = {
        "@id": "audience",
        "source": "taxonomy",
        "taxonomy": "taxonomy_audience",
        "terms": ["boys", "parents"],
    }
    for match, expected in (("any", 2), ("all", 1)):
        save_block(manager, items=[{**item, "match": match}], showOther=False)
        assert len(get_month(anonymous)["events"]) == expected
