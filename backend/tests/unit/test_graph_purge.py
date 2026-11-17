"""Saving a file purges the pages that draw a chart from it, and nothing
else: only on sites with Juizi Blocks, and never at the cost of the save."""

from juizi.blocks.graph import subscribers
from juizi.blocks.interfaces import IBrowserLayer
from types import SimpleNamespace
from zope.interface import alsoProvides

import pytest


class FakeFile:
    def getPhysicalPath(self):
        return ("", "plone", "data.csv")


@pytest.fixture
def purged(monkeypatch):
    events = []
    monkeypatch.setattr(subscribers, "notify", events.append)
    return events


def use_request(monkeypatch, juizi_site):
    request = SimpleNamespace()
    if juizi_site:
        alsoProvides(request, IBrowserLayer)
    monkeypatch.setattr(subscribers, "getRequest", lambda: request)


def links(monkeypatch, result):
    from plone.app.linkintegrity import utils

    def get_incoming_links(obj):
        if isinstance(result, Exception):
            raise result
        return result

    monkeypatch.setattr(utils, "getIncomingLinks", get_incoming_links)


def test_purges_each_page_using_the_file(monkeypatch, purged):
    use_request(monkeypatch, juizi_site=True)
    page = object()
    links(monkeypatch, [SimpleNamespace(from_object=page)])
    subscribers.purge_pages_using_file(FakeFile(), None)
    assert [event.object for event in purged] == [page]


def test_leaves_sites_without_juizi_blocks_alone(monkeypatch, purged):
    use_request(monkeypatch, juizi_site=False)
    links(monkeypatch, [SimpleNamespace(from_object=object())])
    subscribers.purge_pages_using_file(FakeFile(), None)
    assert purged == []


def test_nothing_without_a_request(monkeypatch, purged):
    monkeypatch.setattr(subscribers, "getRequest", lambda: None)
    subscribers.purge_pages_using_file(FakeFile(), None)
    assert purged == []


@pytest.mark.parametrize("error", [KeyError("intid"), RuntimeError("catalog")])
def test_a_lookup_problem_never_stops_the_save(monkeypatch, purged, error):
    use_request(monkeypatch, juizi_site=True)
    links(monkeypatch, error)
    subscribers.purge_pages_using_file(FakeFile(), None)  # doesn't raise
    assert purged == []
