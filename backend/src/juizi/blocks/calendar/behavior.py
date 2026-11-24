"""The "Calendar entry only" tick box on events."""

from juizi.blocks import _
from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope import schema
from zope.interface import provider


BEHAVIOR = "juizi.blocks.calendar_entry"
EVENT_BEHAVIORS = ("plone.eventbasic", "plone.app.event.dx.behaviors.IEventBasic")


@provider(IFormFieldProvider)
class ICalendarEntry(model.Schema):
    calendar_entry_only = schema.Bool(
        title=_("Calendar entry only (no detail page)"),
        description=_(
            "Tick this when there is nothing more to read, like a public "
            "holiday or term date. Calendars show the event but don't link "
            "to this page."
        ),
        required=False,
        default=False,
        missing_value=False,
    )
