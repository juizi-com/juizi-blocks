import { defineMessages } from 'react-intl';

export default defineMessages({
  blockTitle: { id: 'Events calendar', defaultMessage: 'Events calendar' },

  // Visitors
  previousMonth: {
    id: 'juizi-calendar-previous-month',
    defaultMessage: 'Previous month, {month}',
  },
  nextMonth: {
    id: 'juizi-calendar-next-month',
    defaultMessage: 'Next month, {month}',
  },
  today: { id: 'juizi-calendar-today', defaultMessage: 'Today' },
  filters: {
    id: 'juizi-calendar-filters',
    defaultMessage: 'Show events by type',
  },
  allEvents: { id: 'juizi-calendar-all-events', defaultMessage: 'All events' },
  otherEvents: {
    id: 'juizi-calendar-other-events',
    defaultMessage: 'Other events',
  },
  gridHelp: {
    id: 'juizi-calendar-grid-help',
    defaultMessage:
      'Use the arrow keys to move between days, Page Up and Page Down to change month, and Enter to show the events of a day.',
  },
  eventCount: {
    id: 'juizi-calendar-event-count',
    defaultMessage: '{count, plural, one {# event} other {# events}}',
  },
  noEvents: { id: 'juizi-calendar-no-events', defaultMessage: 'no events' },
  noneShown: {
    id: 'juizi-calendar-none-shown',
    defaultMessage: 'no events shown',
  },
  hiddenCount: {
    id: 'juizi-calendar-hidden-count',
    defaultMessage:
      '{count, plural, one {# hidden by filters} other {# hidden by filters}}',
  },
  hiddenByFilters: {
    id: 'juizi-calendar-hidden-by-filters',
    defaultMessage:
      '{count, plural, one {# event hidden by filters.} other {# events hidden by filters.}}',
  },
  eventsIn: {
    id: 'juizi-calendar-events-in',
    defaultMessage: 'Events in {month}',
  },
  showMonth: {
    id: 'juizi-calendar-show-month',
    defaultMessage: 'Show all of {month}',
  },
  showAll: {
    id: 'juizi-calendar-show-all',
    defaultMessage: 'Show all events',
  },
  emptyDay: {
    id: 'juizi-calendar-empty-day',
    defaultMessage: 'No events on this day.',
  },
  emptyMonth: {
    id: 'juizi-calendar-empty-month',
    defaultMessage: 'No events in {month}.',
  },
  nextEvent: {
    id: 'juizi-calendar-next-event',
    defaultMessage: 'Next event: {date}',
  },
  viewEvents: {
    id: 'juizi-calendar-view-events',
    defaultMessage: 'View events',
  },
  eachDay: {
    id: 'juizi-calendar-each-day',
    defaultMessage: '{time} each day',
  },
  allDay: { id: 'juizi-calendar-all-day', defaultMessage: 'All day' },
  dateRange: {
    id: 'juizi-calendar-date-range',
    defaultMessage: '{start} to {end}',
  },
  moreShort: {
    id: 'juizi-calendar-more-short',
    defaultMessage: '+{count} more',
  },
  newTab: {
    id: 'juizi-calendar-new-tab',
    defaultMessage: '(opens in a new tab)',
  },
  timesIn: {
    id: 'juizi-calendar-times-in',
    defaultMessage: 'Times are shown in {zone} time.',
  },
  loading: {
    id: 'juizi-calendar-loading',
    defaultMessage: 'Loading events…',
  },
  loadFailed: {
    id: 'juizi-calendar-load-failed',
    defaultMessage: 'The events couldn’t be loaded.',
  },
  feedFailed: {
    id: 'juizi-calendar-feed-failed',
    defaultMessage: 'These events couldn’t be loaded: {names}.',
  },
  retry: { id: 'juizi-calendar-retry', defaultMessage: 'Try again' },
  subscribe: {
    id: 'juizi-calendar-subscribe',
    defaultMessage: 'Add to your calendar',
  },
  subscribeApp: {
    id: 'juizi-calendar-subscribe-app',
    defaultMessage: 'Subscribe in your calendar app',
  },
  subscribeAppHelp: {
    id: 'juizi-calendar-subscribe-app-help',
    defaultMessage:
      'Opens Apple Calendar or Outlook. New and changed events keep coming through.',
  },
  download: {
    id: 'juizi-calendar-download',
    defaultMessage: 'Download the events (.ics)',
  },
  downloadHelp: {
    id: 'juizi-calendar-download-help',
    defaultMessage: 'A copy of the events as they are now. It won’t update.',
  },
  calendarLink: {
    id: 'juizi-calendar-link',
    defaultMessage: 'Calendar link',
  },
  calendarLinkHelp: {
    id: 'juizi-calendar-link-help',
    defaultMessage:
      'For Google Calendar: under Other calendars, choose From URL and paste this link. Other calendar apps have a similar option.',
  },
  copyLink: { id: 'juizi-calendar-copy-link', defaultMessage: 'Copy link' },
  linkCopied: {
    id: 'juizi-calendar-link-copied',
    defaultMessage: 'Link copied',
  },
  copyFailed: {
    id: 'juizi-calendar-copy-failed',
    defaultMessage: 'Couldn’t copy. Select the link and copy it yourself.',
  },

  // Editors: hints on the canvas
  unfinishedItems: {
    id: 'juizi-calendar-unfinished-items',
    defaultMessage:
      '{count, plural, one {# event type isn’t finished, so visitors don’t see it. Choose what goes in it in the sidebar.} other {# event types aren’t finished, so visitors don’t see them. Choose what goes in them in the sidebar.}}',
  },
  noItemsHint: {
    id: 'juizi-calendar-no-items-hint',
    defaultMessage:
      'All events are shown. To sort them into types with their own colours, add event types in the sidebar.',
  },
  accentWarning: {
    id: 'juizi-calendar-accent-warning',
    defaultMessage:
      'That button colour is too pale to read on white, so dark grey is used instead.',
  },
  paleWarning: {
    id: 'juizi-calendar-pale-warning',
    defaultMessage:
      'These colours are pale on the calendar, so their dots get a grey outline: {names}.',
  },

  // Editors: sidebar
  heading: {
    id: 'juizi-calendar-heading-help',
    defaultMessage:
      'Screen readers use it to name the calendar, so even a short one helps.',
  },
  intro: {
    id: 'juizi-calendar-intro',
    defaultMessage: 'Text under the title',
  },
  eventTypes: {
    id: 'juizi-calendar-event-types',
    defaultMessage: 'Event types',
  },
  eventType: { id: 'juizi-calendar-event-type', defaultMessage: 'Event type' },
  addEventType: {
    id: 'juizi-calendar-add-event-type',
    defaultMessage: 'Add event type',
  },
  itemsHelp: {
    id: 'juizi-calendar-items-help',
    defaultMessage:
      'The calendar shows them in this order. An event that fits more than one takes the colour of the one highest in this list.',
  },
  what: {
    id: 'juizi-calendar-what',
    defaultMessage: 'What are we showing?',
  },
  whatHelp: {
    id: 'juizi-calendar-what-help',
    defaultMessage:
      'Pick one or more kinds of event. Leave it empty for every kind.',
  },
  whatFeed: {
    id: 'juizi-calendar-what-feed',
    defaultMessage: 'Another calendar, by its link (Google, Outlook)',
  },
  noKinds: {
    id: 'juizi-calendar-no-kinds',
    defaultMessage:
      'No kinds of event are switched on for calendars yet. Ask your site administrator to switch some on in Site Setup › Juizi Blocks › Calendar.',
  },
  techEvent: {
    id: 'juizi-calendar-tech-event',
    defaultMessage: 'Which tech event?',
  },
  techEventHelp: {
    id: 'juizi-calendar-tech-event-help',
    defaultMessage: 'Optional. Left empty, sessions from every tech event.',
  },
  filterBy: { id: 'juizi-calendar-filter-by', defaultMessage: 'Which ones?' },
  filterAll: { id: 'juizi-calendar-filter-all', defaultMessage: 'All of them' },
  filterTags: {
    id: 'juizi-calendar-filter-tags',
    defaultMessage: 'Tags',
  },
  values: { id: 'juizi-calendar-values', defaultMessage: 'Choose' },
  switchedOff: {
    id: 'juizi-calendar-switched-off',
    defaultMessage: 'switched off',
  },
  notOffered: {
    id: 'juizi-calendar-not-offered',
    defaultMessage: 'no longer offered',
  },
  gone: { id: 'juizi-calendar-gone', defaultMessage: 'no longer on the site' },
  kindSwitchedOff: {
    id: 'juizi-calendar-kind-switched-off',
    defaultMessage:
      'A kind marked "switched off" can no longer appear in calendars, so this calendar leaves those events out. Your site administrator can switch it back on in Site Setup › Juizi Blocks › Calendar.',
  },
  listNotOffered: {
    id: 'juizi-calendar-list-not-offered',
    defaultMessage:
      'This list is no longer offered for new calendars. This calendar still uses it, until you choose another.',
  },
  valuesGone: {
    id: 'juizi-calendar-values-gone',
    defaultMessage:
      'Anything marked "no longer on the site" matches nothing. Remove it or choose another.',
  },
  tags: { id: 'juizi-calendar-tags', defaultMessage: 'Tags' },
  tagsHelp: {
    id: 'juizi-calendar-tags-help',
    defaultMessage:
      'Tags already used on this site. To use a new one, add it to an event first.',
  },
  staleWarning: {
    id: 'juizi-calendar-stale',
    defaultMessage:
      '{name}: last updated {count, plural, one {# day} other {# days}} ago. Check the link.',
  },
  match: {
    id: 'juizi-calendar-match',
    defaultMessage: 'An event needs',
  },
  matchAny: {
    id: 'juizi-calendar-match-any',
    defaultMessage: 'Any of these (or)',
  },
  matchAll: {
    id: 'juizi-calendar-match-all',
    defaultMessage: 'All of these (and)',
  },
  feed: { id: 'juizi-calendar-feed', defaultMessage: 'Calendar link' },
  feedHelp: {
    id: 'juizi-calendar-feed-help',
    defaultMessage:
      'In Google Calendar, open Settings, choose the calendar and copy its address in iCal format. In Outlook, publish the calendar and copy the ICS link. The link is hidden once you save. Everyone who sees this page will see those events. Changes there usually show here within 15 minutes, or later if that calendar is slow to pass them on.',
  },
  name: { id: 'juizi-calendar-name', defaultMessage: 'Name on the button' },
  nameHelp: {
    id: 'juizi-calendar-name-help',
    defaultMessage:
      'Optional. Left empty, it uses what you chose for this event type.',
  },
  color: { id: 'juizi-calendar-color', defaultMessage: 'Colour' },
  colorHelp: {
    id: 'juizi-calendar-color-help',
    defaultMessage: 'Optional. Left empty, a colour is picked for you.',
  },
  showOther: {
    id: 'juizi-calendar-show-other',
    defaultMessage: 'Show other events',
  },
  showOtherHelp: {
    id: 'juizi-calendar-show-other-help',
    defaultMessage:
      'Events that fit none of your event types show in grey, so none go missing.',
  },
  whichEvents: {
    id: 'juizi-calendar-which-events',
    defaultMessage: 'Which events',
  },
  folder: {
    id: 'juizi-calendar-folder',
    defaultMessage: 'Only events inside this folder',
  },
  folderHelp: {
    id: 'juizi-calendar-folder-help',
    defaultMessage:
      'Optional. Left empty, it shows events from the whole site, in this page’s language.',
  },
  datesTimes: {
    id: 'juizi-calendar-dates-times',
    defaultMessage: 'Dates and times',
  },
  timezone: { id: 'juizi-calendar-timezone', defaultMessage: 'Time zone' },
  timezoneHelp: {
    id: 'juizi-calendar-timezone-help',
    defaultMessage:
      'Leave empty to follow the site’s time zone. Set it only for a calendar meant for people in another country. All-day events keep their date.',
  },
  weekStart: {
    id: 'juizi-calendar-week-start',
    defaultMessage: 'Weeks start on',
  },
  weekStartHelp: {
    id: 'juizi-calendar-week-start-help',
    defaultMessage:
      'Leave empty to follow the site. Set it only for a calendar meant for people whose week starts on another day.',
  },
  asTheSite: {
    id: 'juizi-calendar-as-the-site',
    defaultMessage: 'As the site',
  },
  monday: { id: 'juizi-calendar-monday', defaultMessage: 'Monday' },
  sunday: { id: 'juizi-calendar-sunday', defaultMessage: 'Sunday' },
  accent: {
    id: 'juizi-calendar-accent',
    defaultMessage: 'Button and today colour',
  },
  sharing: {
    id: 'juizi-calendar-sharing',
    defaultMessage: 'Let visitors subscribe',
  },
  showSubscribe: {
    id: 'juizi-calendar-show-subscribe',
    defaultMessage: 'Show a subscribe link',
  },
  showSubscribeHelp: {
    id: 'juizi-calendar-show-subscribe-help',
    defaultMessage:
      'Visitors can add this calendar to their own and it stays up to date. Events from other calendars aren’t included.',
  },
});
