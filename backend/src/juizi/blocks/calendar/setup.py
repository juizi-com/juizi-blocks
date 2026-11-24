"""Setting up the Events calendar on a site.

The block is off by default, and a site that doesn't use it is left alone:
installing or upgrading only adds an empty catalog index and column. The
"Calendar entry only" tick box on events, and indexing the events, wait
until the site owner switches the block on in the dashboard (``activate``).
"""

from juizi.blocks.calendar import BLOCK_TYPE
from juizi.blocks.calendar import techevent
from juizi.blocks.calendar import siteconfig
from juizi.blocks.calendar.behavior import BEHAVIOR
from plone import api
from plone.event.interfaces import IEvent
from plone.registry.interfaces import IRegistry
from zope.component import getUtility

import logging


logger = logging.getLogger("juizi.blocks")


def add_behavior(context=None):
    """Every kind of event can appear in calendars until the site owner
    switches some off. Tech event slots too: breaks still only show under
    an event type that asks for them."""
    for info in siteconfig.candidate_types(api.portal.get()):
        if BEHAVIOR not in info.behaviors:
            info.manage_changeProperties(behaviors=(*info.behaviors, BEHAVIOR))


def index_events(context=None):
    catalog = api.portal.get_tool("portal_catalog")
    if "juizi_event_kind" not in catalog.indexes():
        return
    interfaces = [IEvent.__identifier__]
    if techevent.IScheduleSlot is not None:
        interfaces.append(techevent.IScheduleSlot.__identifier__)
    brains = catalog.unrestrictedSearchResults(object_provides=interfaces)
    for brain in brains:
        try:
            obj = brain._unrestrictedGetObject()
        except (AttributeError, KeyError):
            continue
        # With idxs, the modification date is left alone.
        catalog.catalog_object(obj, idxs=["juizi_event_kind"], update_metadata=True)
    logger.info("Calendar: indexed %s events", len(brains))


def is_on(disabled_blocks, enabled_blocks) -> bool:
    """Whether the block is switched on, given the dashboard's lists. Off by
    default, so on means "in enabled_blocks and not in disabled_blocks"."""
    return BLOCK_TYPE in (enabled_blocks or []) and BLOCK_TYPE not in (
        disabled_blocks or []
    )


def site_is_on() -> bool:
    registry = getUtility(IRegistry)
    return is_on(
        registry.get("juizi.blocks.disabled_blocks"),
        registry.get("juizi.blocks.enabled_blocks"),
    )


def activate(context=None):
    """The block has been switched on: let events appear in calendars."""
    add_behavior()
    index_events()


def install(context=None):
    """Install and upgrade: only for a site that already uses the block."""
    if site_is_on():
        activate()
