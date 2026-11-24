/** Sorting a month's events into what each day shows. */
import { addDays, daysBetween } from './dates';

export const OTHER = '_other';
export const LABELS_PER_DAY = 2;
export const BARS_PER_DAY = 3;
// Longer than this and an event is a thin bar, so short ones keep the room.
export const LONG_DAYS = 3;

export const isLong = (event) =>
  daysBetween(event.start, event.end) >= LONG_DAYS;

export const isOn = (event, day) => event.start <= day && event.end >= day;

export const overlaps = (event, start, end) =>
  event.start <= end && event.end >= start;

/** No selection is all events. Several widen the results. */
export const filterEvents = (events, selected) =>
  selected.length
    ? events.filter((event) => event.types.some((id) => selected.includes(id)))
    : events;

/**
 * What each day shows: { [iso]: { all, hidden, short, bars } }. A long event
 * keeps the same bar row for as long as it runs.
 */
export const buildDays = (days, events, selected = []) => {
  const shown = filterEvents(events, selected);
  const rows = new Map();
  const rowEnds = [];
  shown.filter(isLong).forEach((event) => {
    let row = rowEnds.findIndex((end) => end < event.start);
    if (row < 0) row = rowEnds.length;
    rowEnds[row] = event.end;
    rows.set(event.id, row);
  });

  const result = {};
  days.forEach((day, index) => {
    const all = shown.filter((event) => isOn(event, day));
    const bars = [];
    all.forEach((event) => {
      const row = rows.get(event.id);
      if (row === undefined || row >= BARS_PER_DAY) return;
      bars[row] = {
        event,
        starts: event.start === day,
        ends: event.end === day,
      };
    });
    const short = all.filter((event) => !rows.has(event.id));
    // A bar says nothing by itself: name a long event where it begins (or
    // where the calendar does), when that day has room for the label.
    const begins = all.filter(
      (event) =>
        rows.has(event.id) &&
        (event.start === day || (index === 0 && event.start < day)),
    );
    result[day] = {
      all,
      hidden: events.filter((event) => isOn(event, day)).length - all.length,
      labels: [
        ...short,
        ...begins.slice(0, Math.max(0, LABELS_PER_DAY - short.length)),
      ],
      short,
      bars,
    };
  });
  // A week's days keep the same rows, or a bar would step up and down.
  for (let at = 0; at < days.length; at += 7) {
    const week = days.slice(at, at + 7);
    const height = Math.max(...week.map((day) => result[day].bars.length));
    week.forEach((day) => {
      result[day].bars.length = height;
    });
  }
  return result;
};

/** The first event after `day` in the loaded events. */
export const nextAfter = (events, day) => {
  const tomorrow = addDays(day, 1);
  const found = events
    .filter((event) => event.start >= tomorrow)
    .map((event) => event.start)
    .sort()[0];
  return found || null;
};
