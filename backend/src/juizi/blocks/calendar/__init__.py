"""The Events calendar block's server side (``juiziCalendar``).

- ``behavior``, ``indexers``: "Calendar entry only", and the catalog column
  that lets a month be drawn without loading a single event.
- ``options``: what a saved block asks for, cleaned up.
- ``events``, ``recurrence``: this site's events for a range of days.
- ``feeds``, ``fetch``, ``store``: other calendars by their iCal link.
- ``data``: the month the block draws.
- ``service``, ``transforms``: how it reaches the browser.
- ``ics``: the calendar file people can subscribe to.
"""

BLOCK_TYPE = "juiziCalendar"
OTHER = "_other"
