"""Breaks, slots and registration stay out of calendars unless a rule asks
for them, even when "Show other events" is on."""

from juizi.blocks.calendar import OTHER
from juizi.blocks.calendar.events import shown_records
from juizi.blocks.calendar.options import Item
from juizi.blocks.calendar.options import Options


class Brain:
    def __init__(self, rid, portal_type, rooms=False):
        self.rid = rid
        self.portal_type = portal_type
        self.juizi_event_info = {"rooms": []} if rooms else {}

    def getRID(self):
        return self.rid


class Catalog:
    def __init__(self, brains):
        self.brains = brains

    def indexes(self):
        return ["portal_type"]

    def searchResults(self, portal_type=None, **query):
        wanted = portal_type["query"] if isinstance(portal_type, dict) else portal_type
        return [b for b in self.brains if not wanted or b.portal_type in wanted]


BRAINS = [
    Brain(1, "Talk", rooms=True),
    Brain(2, "Break", rooms=True),
    Brain(3, "Slot", rooms=True),
]


def shown(items):
    options = Options("UTC", "UTC", items, True, 0, None, False)
    return {
        brain.portal_type: types
        for brain, types in shown_records(Catalog(BRAINS), [{}], options)
    }


def test_hidden_when_no_rule_asks():
    assert shown([]) == {"Talk": [OTHER]}


def test_shown_under_a_rule_that_asks():
    rule = Item(id="routine", source="type", values=["Break", "Slot"])
    assert shown([rule]) == {"Talk": [OTHER], "Break": ["routine"], "Slot": ["routine"]}
