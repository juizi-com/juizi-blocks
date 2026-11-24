# Events calendar (`juiziCalendar`)

A month of this site's events, and of other calendars by iCal link, with a
list beside it and filter buttons the editor defines. Works with and without
Volto Light Theme. Server side: `backend/src/juizi/blocks/calendar/`.

## Switching it on

The block is **off by default**. A site owner (Manager) switches it on in
Site Setup → Juizi Blocks → Blocks and saves. Only then does the site
change: every kind of event gets the "Calendar entry only" tick box, and
existing events are indexed for calendars, which takes a moment on a site
with many events. Installing or upgrading the add-on only adds an empty
catalog index and column, so a site that never uses the calendar is left
alone. Switching it off again keeps the tick box and the index; blocks
already on pages keep working.

## Happy path (draft, confirm in first-time editor test)

1. Add **Events calendar**. All events show straight away.
2. Give it a title.
3. Under **Event types**, add one. **What are we showing?** picks one or more
   kinds of event (left empty: every kind), or another calendar by its link.
   Where the site offers only one kind, this step isn't shown.
4. **Which ones?** picks "All of them", tags, or one of the lists the site
   owner offers (and, for talks, keynotes and trainings, their track, level
   or audience). Then pick the values.
5. With two or more values, choose **Any of these (or)** or **All of these (and)**.
6. Optionally name it and give it a colour. The list's order is the
   calendar's order: drag an item, or open it and use Move up / Move down.
7. Save. Publish the events: visitors only see published, unexpired ones.

Where an editor may hesitate:

- The canvas shows the editor's own drafts, like every listing. Visitors don't see them.
- Tags must exist on an event before they can be picked.
- A saved link reads "Saved link (host) #…". Paste over it to replace it.
- Finding a Google or Outlook iCal link is several steps in those products.
- Move up / Move down are at the bottom of an open item, below its colour.
- "Which ones?" lists only what fits the kinds picked: track, level and
  audience appear once a session kind is picked, or with no kind picked.
- Picking another list in "Which ones?" empties the values picked before.

## What the site owner sets (Site Setup › Juizi Blocks › Calendar)

The owner decides what *can* be shown; the editor decides what this calendar
shows, from that. Stored in `@juizi-calendar-settings`
(`backend/.../calendar/siteconfig.py`).

- **Kinds of event calendars can show.** A content type is available when
  it has the "Calendar entry only" behaviour, so that tick box and the
  permission are one switch. Off means no calendar shows it, saved ones
  included, and the editor sees it marked "switched off".
- **Lists editors can choose events by.** The taxonomies meant for
  calendars, each with the name editors see. Tags are always offered. A list
  taken off here keeps working in calendars that already use it; the editor
  sees it marked "no longer offered".
- **Other calendars.** Whether editors may add calendars by their link. Off
  means calendars leave them out, saved ones included.
- **Time zone and week start stay per block**, as overrides of the site's
  own settings: calendars can serve groups in other countries.

## Decisions

- **One layout**, so no display-style start screen.
- **One list, one order.** The edit list's order is the order of the buttons,
  decides the colour where an event fits several, and puts events that start
  at the same time in that order. Otherwise a day runs by time.
- **"Add to your calendar" is an icon button at the right of the title**
  (above the card without one). It opens a small panel in the block:
  Subscribe in a calendar app (`webcal:`, HTTPS sites only), Download the
  events (.ics, a one-off copy), and the link with a Copy button and a line on
  pasting it into Google Calendar. Focus moves into the panel; Escape, a click
  outside or tabbing out closes it.
- **No item ticked is all events**, ticking several is "or". The first
  matching item in the editor's order gives the colour; all names are in the list.
- **Other events** are grey and on by default.
- **Four days or longer is a thin bar**, named once where it begins and
  in full in the list, so short events keep the labels.
- **Time zone and week start are per block**, left empty to follow the
  site (its time zone, and Site Setup › Date and Time's first weekday: a
  site starting on Sunday gets Sunday weeks, any other day Monday). All-day
  events never shift.
- **Rules saved before 23 November 2026** (a `source` of tags, taxonomy,
  session, type or feed) are read as before by the server and take the new
  shape (`what`, `filterBy`, `values`) once the editor changes the block.
- **Beside the grid the list scrolls** at the month's height; below 860px of
  block width it is under the grid in full.
- **Coloured text only where it passes 4.5:1**, else dark text with the colour
  as bar and dot. Pale dots get an outline. Buttons fall back to dark grey
  when the chosen colour is too pale.
- **Sizes** are rem-based, scaled to 16px on both themes' usual roots. A theme
  with another root sets `--juizi-calendar-unit`. Also:
  `--juizi-calendar-width`, `--juizi-calendar-radius`.
- **A block saves calendar links outside the page.** Plone's
  `@search?metadata_fields=blocks` returns raw blocks to anyone, so block
  serializers can't hide anything.

## With collective.taxonomy

The site owner ticks the taxonomies meant for calendars in Site Setup ›
Juizi Blocks › Calendar; editors then find them under "Which ones?" by the
name the owner gave. A taxonomy is only offered for the kinds of event it is
switched on for. Any field prefix works. A parent term also finds events
under its children.

## With collective.techevent

Nothing to configure beyond the Calendar tab, and juizi-blocks doesn't
depend on it.

- Every scheduled kind is available until the owner switches it off: Talk,
  Training, Keynote, Meeting, Open space, Lightning talks, Break, Slot. A
  session's rooms are its place.
- **Breaks and Slots only show under an event type that asks for them** by
  kind. On a month they would push the sessions out of sight.
- Track, Level and Audience are in "Which ones?" for talks, keynotes and
  trainings, with "Which tech event?" when the site has more than one. Room
  is no longer offered; rules saved with it still work.
- "Only events inside this folder" set to a Tech Event gives that event alone.
- **Both times at 00:00 UTC is dates only**: tech event has no "whole day"
  on its own slots, and that is what editors save.
- **A series that repeats inside its own dates** (first to last day, and
  daily over them) is read as that one long event, or as each day's session
  when it has times, not as copies on top of each other.
- **Four or more days in a row with the same hours are one thin bar**,
  "09:00–13:00 each day" in the list. The subscribe file gets each day by
  itself. This holds for ordinary events too.
- Session pages need tech event's own front end, which needs Volto Light
  Theme. On plain Volto the calendar works and those pages are empty.

## Accessibility

A date grid with one tab stop (arrows, Home, End, Page Up and Down; Enter or
Space selects), each day named by date and count and described by its events.
Links are in the list only. One status message after each change, none on
load. Filters are pressed buttons.

Ready for screen-reader testing, not yet tested with NVDA or VoiceOver.

## Known issues and limits

- Plone's date indexes lose a repeating event's past dates and stop at 1,000
  occurrences. This block has its own index (upgrade 1005) and expands series itself.
- The list widgets of Volto 18 and Volto Light Theme 7 pick an item up by
  keyboard but don't drop it, hence the Move buttons inside each item
  (also WCAG 2.5.7). Volto's own list numbers its items: the block shows
  their names with CSS.
- Volto's Columns (grid) block only allows its own four block types, so the
  calendar shows as "Unknown Block" there unless the site allows it.
- collective.taxonomy was tried with 3.1.7 and collective.techevent with
  Juizi's fork (12153b9), both with invented content.
- `webcal:` opens Apple Calendar and Outlook. Google Calendar and most Android
  phones need the link pasted in, hence Copy link. Google refreshes a
  subscribed calendar on its own schedule, which can take hours.
- Feeds are cached per Zope process for 15 minutes and refreshed by visits.
  The browser's request waits up to 6 seconds for a newer copy. While a
  calendar is failing the last good one shows, and after a day editors are
  warned. A restart loses that copy. The subscribe file has
  this site's events only. `webcal:` links need the site on HTTPS.

## Copying to a Google Calendar (future)

Not in this release. People who want the events in their own calendar
subscribe to the block's iCal file, and a page that embeds a Google Calendar
can show this block instead. A one-way copy into a Google Calendar may come
later: an early version is kept for reference in `reference/google-push/`,
outside the add-on, so it isn't installed and can't run.
