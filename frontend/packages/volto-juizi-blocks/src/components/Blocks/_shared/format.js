/**
 * Date and number formatting for visitor-facing text. Always en-GB
 * ("13 November 2024", "1,000"), so the server and every browser produce
 * the same output and the page doesn't change when it loads.
 */
const LOCALE = 'en-GB';

export const formatDate = (
  value,
  options = { year: 'numeric', month: 'long', day: 'numeric' },
) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, options);
};

export const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString(LOCALE);
