"""The calendar's indexers for slots, which needn't be events."""

from collective.techevent.behaviors.schedule import IScheduleSlot
from juizi.blocks.calendar.indexers import event_info
from juizi.blocks.calendar.indexers import event_kind
from plone.indexer.decorator import indexer


@indexer(IScheduleSlot)
def slot_kind(obj):
    return event_kind(obj)


@indexer(IScheduleSlot)
def slot_info(obj):
    return event_info(obj)
