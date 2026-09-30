from juizi.blocks.setuphandlers.language_demo import PAGE_ID
from juizi.blocks.setuphandlers.language_demo import REDIRECT_ID
from juizi.blocks.setuphandlers.language_demo import setup_language_demo
from juizi.blocks.setuphandlers.language_demo_texts import LANGUAGES
from juizi.blocks.setuphandlers.language_demo_texts import TEXTS
from plone import api
from plone.app.multilingual.interfaces import ITranslationManager
from plone.base.interfaces import ILanguage

import pytest


SHOWCASE_BLOCKS = [
    "title",
    "juiziHero",
    "contentRow",
    "emblaCarousel",
    "emblaGallery",
    "juiziCallout",
]


def block_types(page):
    return [page.blocks[uid]["@type"] for uid in page.blocks_layout["items"]]


@pytest.fixture
def demo(portal):
    with api.env.adopt_roles(["Manager"]):
        setup_language_demo(portal)
    return portal


class TestLanguageDemo:
    def test_every_language_has_texts(self):
        assert sorted(TEXTS) == sorted(LANGUAGES)
        keys = set(TEXTS[LANGUAGES[0]])
        for language in LANGUAGES:
            assert set(TEXTS[language]) == keys, language

    def test_site_is_multilingual(self, demo):
        assert api.portal.get_registry_record("plone.available_languages") == LANGUAGES
        assert api.portal.get_registry_record("plone.default_language") == "en"
        for language in LANGUAGES:
            assert demo[language].portal_type == "LRF"

    @pytest.mark.parametrize("language", LANGUAGES)
    def test_showcase_page(self, demo, language):
        page = demo[language][PAGE_ID]
        assert page.title == TEXTS[language]["title"]
        assert ILanguage(page).get_language() == language
        assert api.content.get_state(page) == "published"
        # One of each block; the Redirect has its own page.
        assert block_types(page) == SHOWCASE_BLOCKS
        assert block_types(page[REDIRECT_ID]) == ["title", "redirectBlock"]
        # The gallery shows the pictures stored in the page.
        pictures = [item for item in page.objectValues() if item.portal_type == "Image"]
        assert len(pictures) == 4
        assert ILanguage(pictures[0]).get_language() == language

    def test_pages_are_translations_of_each_other(self, demo):
        translations = ITranslationManager(demo["en"][PAGE_ID]).get_translations()
        assert sorted(translations) == sorted(LANGUAGES)
        assert translations["af"].title == TEXTS["af"]["title"]

    def test_links_are_stored_as_references(self, demo):
        page = demo["fr"][PAGE_ID]
        callout = next(
            block for block in page.blocks.values() if block["@type"] == "juiziCallout"
        )
        assert "resolveuid" in callout["link"][0]["@id"]
        assert callout["linkTitle"] == TEXTS["fr"]["callout_link"]

    def test_running_again_changes_nothing(self, demo):
        before = {language: demo[language][PAGE_ID].UID() for language in LANGUAGES}
        with api.env.adopt_roles(["Manager"]):
            setup_language_demo(demo)
        after = {language: demo[language][PAGE_ID].UID() for language in LANGUAGES}
        assert before == after
