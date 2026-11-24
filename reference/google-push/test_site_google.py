"""Was in backend/tests/calendar/test_site.py; uses its `site` fixture."""

from datetime import datetime
from juizi.blocks.calendar import google


def test_google_only_gets_what_visitors_see(site):
    bodies, *_ = google.desired_events(
        site["calendar-page"],
        "cal",
        "https://www.example.org",
        today=datetime(2026, 11, 1).date(),
    )
    sent = {body["summary"]: body for body in bodies}
    assert "draft" not in sent
    assert "https://www.example.org/match" in sent["match"]["description"]
    assert "example.org" not in sent["holiday"]["description"]
