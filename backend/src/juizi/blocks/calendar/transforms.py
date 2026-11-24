"""The calendar block as pages are sent and saved."""

from juizi.blocks.calendar import BLOCK_TYPE
from juizi.blocks.calendar import store
from juizi.blocks.calendar.data import month_data
from juizi.blocks.calendar.options import read_options
from plone.restapi.interfaces import IBlockFieldDeserializationTransformer
from plone.restapi.interfaces import IBlockFieldSerializationTransformer
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface

import logging


logger = logging.getLogger("juizi.blocks")

DATA_KEY = "calendarData"


@implementer(IBlockFieldSerializationTransformer)
@adapter(Interface, Interface)
class CalendarSerializer:
    """This month comes with the page, for the server render.

    Feeds only come from the cache here, so a slow calendar elsewhere can't
    hold up the page; the browser asks again for those still pending.
    """

    order = 0
    block_type = BLOCK_TYPE

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, block):
        block = dict(block)
        block.pop(DATA_KEY, None)
        try:
            options = read_options(self.context, block)
            block[DATA_KEY] = month_data(self.context, options, may_wait=False)
        except Exception:
            # The browser asks again; a calendar mustn't take the page down.
            logger.exception("Calendar on %s", self.context.absolute_url())
        return block


@implementer(IBlockFieldDeserializationTransformer)
@adapter(Interface, Interface)
class CalendarDeserializer:
    """Never saves the month, and never a calendar link (see ``store``)."""

    order = 0
    block_type = BLOCK_TYPE

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, block):
        block = dict(block)
        block.pop(DATA_KEY, None)
        if isinstance(block.get("items"), list):
            block["items"] = [self.hide_link(item) for item in block["items"]]
        return block

    def hide_link(self, item):
        # Whatever the source: a link left behind by changing it is as secret.
        if not isinstance(item, dict) or not item.get("feed"):
            return item
        value = str(item["feed"]).strip()
        if not store.is_reference(value):
            value = store.save_link(value)
        return {**item, "feed": value}
