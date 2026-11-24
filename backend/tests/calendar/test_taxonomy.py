"""Taxonomies, registered the way collective.taxonomy registers them.

The add-on isn't a dependency, so these stand in for its two utilities and
its translation domain: a term's title is its code until it's translated.
"""

from juizi.blocks.calendar import data
from juizi.blocks.calendar import service
from juizi.blocks.calendar import siteconfig
from juizi.blocks.calendar.behavior import BEHAVIOR as CALENDAR_ENTRY
from juizi.blocks.calendar.options import read_options
from plone.behavior.interfaces import IBehavior
from types import SimpleNamespace
from zope.i18nmessageid import MessageFactory
from zope.schema.interfaces import IVocabularyFactory
from zope.schema.vocabulary import SimpleTerm
from zope.schema.vocabulary import SimpleVocabulary

import pytest


VOCABULARY = "collective.taxonomy.campus"
BEHAVIOR = "collective.taxonomy.generated.campus"


def vocabulary(context):
    message = MessageFactory(VOCABULARY)
    paths = (("a1", "\u241fArts"), ("b2", "\u241fArts\u241fMusic"))
    return SimpleVocabulary([
        SimpleTerm(value=code, title=message(code, default=path))
        for code, path in paths
    ])


@pytest.fixture(params=["campus", "school_campus", "taxonomy_campus"])
def index(request, integration):
    portal = integration["portal"]
    field = request.param
    manager = portal.getSiteManager()
    behavior = SimpleNamespace(
        field_name=field, field_title="Campus", vocabulary_name=VOCABULARY
    )
    manager.registerUtility(behavior, IBehavior, name=BEHAVIOR, event=False)
    manager.registerUtility(
        vocabulary, IVocabularyFactory, name=VOCABULARY, event=False
    )
    portal.portal_catalog.addIndex(field, "KeywordIndex")
    yield portal, field
    manager.unregisterUtility(provided=IBehavior, name=BEHAVIOR)
    manager.unregisterUtility(provided=IVocabularyFactory, name=VOCABULARY)


def test_listed_by_name_whatever_its_prefix(index):
    portal, field = index
    assert service.taxonomies(portal, portal.REQUEST) == [
        {
            "id": field,
            "title": "Campus",
            "terms": [["a1", "Arts"], ["b2", "Arts › Music"]],
        }
    ]


def test_buttons_have_names_not_codes(index):
    portal, field = index
    raw = {"source": "taxonomy", "taxonomy": field, "terms": ["b2"]}
    (item,) = read_options(portal, {"items": [raw]}).items
    assert data.item_label(portal, item, "") == "Arts › Music"


def test_editors_get_only_the_lists_the_owner_offers(index):
    portal, field = index
    event_type = portal.portal_types.Event
    event_type.manage_changeProperties(
        behaviors=(*event_type.behaviors, CALENDAR_ENTRY, BEHAVIOR)
    )
    siteconfig.save({"taxonomies": [], "feeds": False})
    reply = service.sidebar_options(portal, portal.REQUEST)
    assert [row["offered"] for row in reply["taxonomies"]] == [False]

    siteconfig.save({"taxonomies": [{"id": field, "label": "Where"}], "feeds": False})
    reply = service.sidebar_options(portal, portal.REQUEST)
    (row,) = reply["taxonomies"]
    assert (row["offered"], row["title"]) == (True, "Where")
    (event,) = [kind for kind in reply["kinds"] if kind["id"] == "Event"]
    assert event["lists"] == [field]


def test_a_rule_filtered_by_a_taxonomy(index):
    portal, field = index
    raw = {"what": ["Event"], "filterBy": field, "values": ["b2"]}
    (item,) = read_options(portal, {"items": [raw]}).items
    assert (item.source, item.taxonomy, item.kinds) == ("taxonomy", field, ["Event"])
    assert data.item_label(portal, item, "") == "Arts › Music"
