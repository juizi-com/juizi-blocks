"""collective.taxonomy's taxonomies, where that add-on is installed.

Each registers a behaviour that knows its field, which is also its index. The
field's prefix is the site's choice, so it can't be told by its name.
"""

from plone.behavior.interfaces import IBehavior
from Products.CMFCore.utils import getToolByName
from zope.component import getSiteManager
from zope.globalrequest import getRequest
from zope.i18n import translate


GENERATED = "collective.taxonomy.generated."
SEPARATOR = "␟"  # between a term and its parents


def found_taxonomies(context) -> list:
    """(index, behaviour name, behaviour) of each taxonomy."""
    catalog = getToolByName(context, "portal_catalog", None)
    if catalog is None:
        return []
    indexes = set(catalog.indexes())
    found = []
    for name, behavior in getSiteManager(context).getUtilitiesFor(IBehavior):
        if not name.startswith(GENERATED):
            continue
        index = getattr(behavior, "field_name", "")
        # A taxonomy named like one of Plone's own indexes doesn't get one.
        if index in indexes and (
            catalog._catalog.getIndex(index).meta_type == "KeywordIndex"
        ):
            found.append((index, name, behavior))
    return found


def taxonomies(context) -> dict:
    """Index → the behaviour of each taxonomy."""
    return {index: behavior for index, _name, behavior in found_taxonomies(context)}


def taxonomy_types(context) -> dict:
    """Index → the content types each taxonomy is switched on for."""
    ftis = getToolByName(context, "portal_types").objectValues()
    found = {}
    for index, name, _behavior in found_taxonomies(context):
        found[index] = [
            info.getId()
            for info in ftis
            if name in (getattr(info, "behaviors", None) or ())
        ]
    return found


def term_title(term) -> str:
    """A term's name with its parents, "Arts > Music". Its title is a message
    whose id is the term's code, so it has to be translated."""
    title = str(translate(term.title or term.value, context=getRequest()))
    return " \u203a ".join(part for part in title.split(SEPARATOR) if part)
