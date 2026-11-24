/**
 * Dates as plain 'YYYY-MM-DD' strings and months as 'YYYY-MM'. The server
 * has already put every event in the calendar's time zone, so the browser's
 * own zone never comes into it: all maths and formatting here are in UTC.
 */
import { toLocale } from '../_shared/format';

const DAY = 86400000;

const pad = (number) => String(number).padStart(2, '0');

export const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
export const toISO = (date) => date.toISOString().slice(0, 10);
export const monthOf = (iso) => iso.slice(0, 7);
export const addDays = (iso, count) =>
  toISO(new Date(toDate(iso).getTime() + count * DAY));
export const daysBetween = (start, end) =>
  Math.round((toDate(end) - toDate(start)) / DAY);

export const addMonths = (month, count) => {
  const [year, number] = month.split('-').map(Number);
  const total = year * 12 + number - 1 + count;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
};

/** The same day a month on, or that month's last day. */
export const addMonthsToDay = (iso, count) => {
  const month = addMonths(monthOf(iso), count);
  const last = addDays(`${addMonths(month, 1)}-01`, -1);
  const day = `${month}-${iso.slice(8)}`;
  return day > last ? last : day;
};

/** Weekday with Monday as 0, like the server's. */
export const weekday = (iso) => (toDate(iso).getUTCDay() + 6) % 7;

/** The month's weeks, whole: [[iso × 7], …]. */
export const monthWeeks = (month, weekStart = 0) => {
  const first = `${month}-01`;
  const after = `${addMonths(month, 1)}-01`;
  let day = addDays(first, -((weekday(first) - weekStart + 7) % 7));
  const weeks = [];
  while (day < after) {
    const start = day;
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(start, index)));
    day = addDays(day, 7);
  }
  return weeks;
};

const formatters = new Map();

const format = (iso, language, options) => {
  const locale = toLocale(language);
  const key = locale + JSON.stringify(options);
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }),
    );
  }
  return formatters.get(key).format(toDate(iso));
};

export const monthName = (month, language) =>
  format(`${month}-01`, language, { month: 'long', year: 'numeric' });

export const dayName = (iso, language, width = 'long') =>
  format(iso, language, { weekday: width });

// The weekday and date apart: whether Intl puts a comma between them
// differs between Node and browsers, and the two must match.
export const fullDate = (iso, language) =>
  `${dayName(iso, language)} ${format(iso, language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`;

export const longDate = (iso, language, withYear = false) =>
  format(iso, language, {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  });

export const shortDate = (iso, language, withYear = false) =>
  format(iso, language, {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
