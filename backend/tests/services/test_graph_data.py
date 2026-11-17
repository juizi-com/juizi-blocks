"""The Data visualisation block's data: read with the page, never saved."""

from juizi.blocks.graph import table
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.app.testing import TEST_USER_ID
from plone.namedfile.file import NamedBlobFile
from plone.restapi.testing import RelativeSession

import contextlib
import pytest
import transaction


CSV = b"Service;Increase\nElectricity;8.63%\nWater;12.50%\n"


@pytest.fixture
def session_factory(functional):
    portal = functional["portal"]
    sessions = []

    def make(auth=None):
        session = RelativeSession(portal.absolute_url())
        session.headers.update({"Accept": "application/json"})
        if auth:
            session.auth = auth
        sessions.append(session)
        return session

    yield make
    for session in sessions:
        session.close()


@pytest.fixture
def manager(session_factory):
    return session_factory((SITE_OWNER_NAME, SITE_OWNER_PASSWORD))


@pytest.fixture
def anonymous(session_factory):
    return session_factory()


@pytest.fixture
def site(functional):
    portal = functional["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    table.cache.clear()
    data_file = api.content.create(
        container=portal,
        type="File",
        id="increases.csv",
        file=NamedBlobFile(CSV, filename="increases.csv", contentType="text/csv"),
    )
    page = api.content.create(container=portal, type="Document", id="report")
    for obj in (data_file, page):
        # Files may have no workflow of their own.
        with contextlib.suppress(Exception):
            api.content.transition(obj=obj, transition="publish")
    page.blocks = {
        "g1": {
            "@type": "graphBlock",
            "chartType": "table",
            "delimiter": ";",
            "csvFile": [{"@id": f"../resolveuid/{data_file.UID()}"}],
        }
    }
    page.blocks_layout = {"items": ["g1"]}
    transaction.commit()
    return {"portal": portal, "file": data_file, "page": page}


def get_block(session):
    response = session.get("/report")
    assert response.status_code == 200
    return response.json()["blocks"]["g1"]


def test_page_carries_current_file_data(site, anonymous):
    block = get_block(anonymous)
    data = block["dataTable"]
    assert data["columns"] == ["Service", "Increase"]
    assert data["rows"] == [["Electricity", "8.63%"], ["Water", "12.50%"]]
    assert data["error"] is None
    assert data["source"]["delimiter"] == ";"


def test_new_upload_shows_at_once(site, anonymous):
    assert len(get_block(anonymous)["dataTable"]["rows"]) == 2
    site["file"].file = NamedBlobFile(
        CSV + b"Refuse;6.20%\n", filename="increases.csv", contentType="text/csv"
    )
    transaction.commit()
    assert len(get_block(anonymous)["dataTable"]["rows"]) == 3


def test_private_file_hidden_from_visitors(site, anonymous, manager):
    data_file = site["file"]
    data_file.manage_permission("View", ["Manager"], acquire=False)
    data_file.reindexObjectSecurity()
    transaction.commit()
    data = get_block(anonymous)["dataTable"]
    assert data["error"] == "private"
    assert data["rows"] == []
    editor_data = get_block(manager)["dataTable"]
    assert editor_data["rows"]
    assert editor_data["fileIsPublic"] is False


def test_missing_file(site, anonymous):
    api.content.delete(obj=site["file"], check_linkintegrity=False)
    transaction.commit()
    assert get_block(anonymous)["dataTable"]["error"] == "missing"


def test_data_never_saved(site, manager):
    block = get_block(manager)
    response = manager.patch(
        "/report", json={"blocks": {"g1": block}, "blocks_layout": {"items": ["g1"]}}
    )
    assert response.status_code == 204
    transaction.begin()
    assert "dataTable" not in site["portal"]["report"].blocks["g1"]


def test_pasted_data_capped(site, manager):
    rows = [[str(i), str(i)] for i in range(table.MAX_ROWS + 50)]
    block = {
        "@type": "graphBlock",
        "dataSource": "paste",
        "chartType": "table",
        "pastedTable": {"columns": ["a", "b"], "rows": rows},
    }
    response = manager.patch("/report", json={"blocks": {"g1": block}})
    assert response.status_code == 204
    transaction.begin()
    saved = site["portal"]["report"].blocks["g1"]
    assert len(saved["pastedTable"]["rows"]) == table.MAX_ROWS
    assert "dataTable" not in get_block(manager)


def test_file_link_counts_for_link_integrity(site, manager):
    block = get_block(manager)
    block["title"] = "Changed"
    manager.patch("/report", json={"blocks": {"g1": block}})
    transaction.begin()
    from plone.app.linkintegrity.utils import getIncomingLinks

    sources = [r.from_object for r in getIncomingLinks(site["portal"]["increases.csv"])]
    assert site["portal"]["report"] in sources


class TestPreviewService:
    def test_text(self, site, manager):
        response = manager.post(
            "/report/@juizi-graph-data",
            json={"text": "a\tb\n1\t2\n", "delimiter": "auto"},
        )
        assert response.status_code == 200
        assert response.json()["columns"] == ["a", "b"]
        assert response.json()["delimiter"] == "\t"

    def test_file(self, site, manager):
        uid = site["file"].UID()
        response = manager.post(
            "/report/@juizi-graph-data",
            json={"file": f"../resolveuid/{uid}", "view": "bar"},
        )
        assert response.json()["rows"][0] == ["Electricity", "8.63%"]

    def test_visitors_cannot_use_it(self, site, anonymous):
        response = anonymous.post("/report/@juizi-graph-data", json={"text": "a;b"})
        assert response.status_code == 401

    def test_needs_file_or_text(self, site, manager):
        response = manager.post("/report/@juizi-graph-data", json={})
        assert response.status_code == 400
