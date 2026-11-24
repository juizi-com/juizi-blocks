# Copy to Google Calendar (reference only)

An early one-way copy from a calendar block into a Google Calendar. **Not
part of the add-on:** this folder isn't packaged, installed or tested, and
the code can't run as it stands (it imports `juizi.blocks.calendar.google`,
which no longer exists). Kept as a starting point if the copy comes back.

What it did: read a block's events as visitors see them, and create, update
or delete matching events in one Google Calendar through a service account.
It only touched events it had created (ids starting with a per-site prefix),
ran as a dry run unless told to write, and stopped before a mass delete. It
was only ever tested against a pretend Google.

To bring it back, at least:

- move `google.py` into `backend/src/juizi/blocks/calendar/` and the tests
  into `backend/tests/calendar/` (`test_site_google.py` belongs in
  `test_site.py`, which has its `site` fixture);
- add the `google` extra (`cryptography`, `pyjwt`) to `backend/pyproject.toml`;
- skip the site's own copies when a block also shows that Google Calendar
  as another calendar (the `own_prefix` check in `feeds.calendar_entries`,
  removed with this code), or the events show twice;
- decide where the settings live (a list of calendars in the dashboard's
  Calendar tab, the key on the server only), who may add them, one block
  per Google calendar, and how to start on a calendar already filled by hand;
- try it against a real Google Calendar before any release.
