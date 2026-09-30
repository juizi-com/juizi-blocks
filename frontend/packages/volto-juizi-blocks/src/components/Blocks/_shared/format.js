/**
 * Date and number formatting for visitor-facing text, in the site's
 * language. Pass `intl.locale`: the server and the browser then produce the
 * same output, so the page doesn't change when it loads. English is always
 * British English ("13 November 2024", "1,000"), as is the fallback when no
 * language is given or the language isn't known.
 */
const FALLBACK = 'en-GB';

/** 'en' → 'en-GB', 'pt_BR' → 'pt-BR', unknown or missing → 'en-GB'. */
export const toLocale = (language) => {
  if (!language || language === 'en') return FALLBACK;
  const locale = String(language).replace('_', '-');
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locale).length
      ? locale
      : FALLBACK;
  } catch (e) {
    return FALLBACK;
  }
};

export const formatDate = (
  value,
  options = { year: 'numeric', month: 'long', day: 'numeric' },
  language,
) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(toLocale(language), options);
};

export const formatNumber = (value, language) =>
  (Number(value) || 0).toLocaleString(toLocale(language));
