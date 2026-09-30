from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.app.testing import TEST_USER_ID
from plone.app.testing import TEST_USER_NAME
from plone.app.testing import TEST_USER_PASSWORD
from plone.restapi.testing import RelativeSession

import pytest
import transaction


ENDPOINT = "/@juizi-blocks-settings"


@pytest.fixture
def api_session(functional):
    portal = functional["portal"]

    def factory(auth=None):
        session = RelativeSession(portal.absolute_url())
        session.headers.update({"Accept": "application/json"})
        if auth:
            session.auth = auth
        return session

    sessions = []

    def make(auth=None):
        session = factory(auth)
        sessions.append(session)
        return session

    yield make
    for session in sessions:
        session.close()


@pytest.fixture
def manager(api_session):
    return api_session((SITE_OWNER_NAME, SITE_OWNER_PASSWORD))


@pytest.fixture
def anonymous(api_session):
    return api_session()


@pytest.fixture
def editor(functional, api_session):
    from plone.app.testing import setRoles

    setRoles(functional["portal"], TEST_USER_ID, ["Editor", "Site Administrator"])
    transaction.commit()
    return api_session((TEST_USER_NAME, TEST_USER_PASSWORD))


VALID_CONFIG = {
    "colors": [
        {"name": "brand", "label": "Brand", "value": "#FF6600", "dark": True},
        {"name": "paper", "label": "Paper", "value": "#ffffff", "dark": False},
    ],
    "themes": [
        {
            "name": "brand",
            "label": "Brand",
            "background": {"color": "brand"},
            "foreground": {"color": "paper"},
        }
    ],
    "blocks": {
        "contentRow": {"colors": ["brand", "gone"]},
    },
}


class TestSettingsGet:
    def test_anonymous_can_read_defaults(self, anonymous):
        response = anonymous.get(ENDPOINT)
        assert response.status_code == 200
        data = response.json()
        assert data["disabled_blocks"] == []
        assert data["enabled_blocks"] == []
        color_config = data["color_config"]
        assert [c["name"] for c in color_config["colors"]][:2] == ["white", "green"]
        assert [t["name"] for t in color_config["themes"]] == [
            "default",
            "green",
            "faded-blue",
        ]
        assert color_config["blocks"] == {}


class TestSettingsBeforeUpgrade:
    def test_get_works_without_new_records(self, functional, anonymous):
        from plone.registry.interfaces import IRegistry
        from zope.component import getUtility

        del getUtility(IRegistry).records["juizi.blocks.enabled_blocks"]
        transaction.commit()
        response = anonymous.get(ENDPOINT)
        assert response.status_code == 200
        assert response.json()["enabled_blocks"] == []


class TestSettingsPatch:
    def test_anonymous_cannot_write(self, anonymous):
        response = anonymous.patch(ENDPOINT, json={"disabled_blocks": ["x"]})
        assert response.status_code == 401

    def test_site_administrator_cannot_write(self, editor):
        # The dashboard is a Manager-only tool (cmf.ManagePortal).
        response = editor.patch(ENDPOINT, json={"disabled_blocks": ["x"]})
        assert response.status_code == 401

    def test_manager_toggles_blocks(self, manager, anonymous):
        response = manager.patch(
            ENDPOINT, json={"disabled_blocks": ["emblaCarousel", "emblaCarousel"]}
        )
        assert response.status_code == 200
        assert response.json()["disabled_blocks"] == ["emblaCarousel"]
        assert anonymous.get(ENDPOINT).json()["disabled_blocks"] == ["emblaCarousel"]

    def test_manager_updates_colors(self, manager):
        response = manager.patch(ENDPOINT, json={"color_config": VALID_CONFIG})
        assert response.status_code == 200
        config = response.json()["color_config"]
        # Hex values are normalised to lowercase.
        assert config["colors"][0]["value"] == "#ff6600"
        # Unknown colour names are dropped from block lists.
        assert config["blocks"] == {"contentRow": {"colors": ["brand"], "themes": []}}

    def test_manager_enables_blocks(self, manager, anonymous):
        response = manager.patch(ENDPOINT, json={"enabled_blocks": ["hero", "toc"]})
        assert response.status_code == 200
        assert anonymous.get(ENDPOINT).json()["enabled_blocks"] == ["hero", "toc"]

    def test_disabled_wins_over_enabled(self, manager):
        response = manager.patch(
            ENDPOINT,
            json={"enabled_blocks": ["hero", "toc"], "disabled_blocks": ["toc"]},
        )
        data = response.json()
        assert data["enabled_blocks"] == ["hero"]
        assert data["disabled_blocks"] == ["toc"]

    def test_partial_patch_keeps_other_keys(self, manager):
        manager.patch(ENDPOINT, json={"disabled_blocks": ["juiziCallout"]})
        response = manager.patch(ENDPOINT, json={"color_config": VALID_CONFIG})
        assert response.json()["disabled_blocks"] == ["juiziCallout"]

    @pytest.mark.parametrize(
        "payload",
        [
            {"disabled_blocks": "emblaCarousel"},
            {"disabled_blocks": ["bad id!"]},
            {"color_config": {"colors": [], "themes": []}},
            {
                "color_config": {
                    **VALID_CONFIG,
                    "colors": [{"name": "brand", "value": "red;}body{"}],
                }
            },
            {
                "color_config": {
                    **VALID_CONFIG,
                    "colors": [{"name": "Bad Name", "value": "#fff"}],
                }
            },
            {
                "color_config": {
                    **VALID_CONFIG,
                    "themes": [{"name": "t", "background": {"color": "brand"}}],
                }
            },
        ],
    )
    def test_invalid_payloads_are_rejected(self, manager, payload):
        response = manager.patch(ENDPOINT, json=payload)
        assert response.status_code == 400
        assert response.json()["error"]["type"] == "ValidationError"
        # Nothing was stored.
        assert manager.get(ENDPOINT).json()["disabled_blocks"] == []
