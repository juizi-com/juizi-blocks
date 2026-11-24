/**
 * The sidebar's event types, each a rule in two steps:
 *
 * - `what`: the kinds of event it shows (content types), or `['feed']` for
 *   another calendar by its link. Empty or `['any']`: any kind.
 * - `filterBy`: `all`, `tags`, a taxonomy's index, or a tech event list
 *   (`session_track`, ...), then the `values` picked from it.
 *
 * Rules saved before 23 November 2026 had a `source` instead. They are
 * converted when the editor opens the block (`upgradeItem`); the server
 * still reads both.
 */

export const FEED = 'feed';
export const ANY = 'any';
export const SESSION_LISTS = [
  'session_track',
  'session_level',
  'session_audience',
];
const OLD_KEYS = [
  'source',
  'tags',
  'taxonomy',
  'terms',
  'sessionList',
  'sessionTerms',
  'types',
];

const list = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export const isOld = (item) =>
  !!item?.source && item.what === undefined && item.filterBy === undefined;

const strip = (item) => {
  const rest = { ...item };
  OLD_KEYS.forEach((key) => delete rest[key]);
  return rest;
};

/** An old rule in the new shape. Anything unknown is left alone. */
export const upgradeItem = (item) => {
  if (!isOld(item)) return item;
  const rest = strip(item);
  switch (item.source) {
    case 'tags':
      return { ...rest, what: [], filterBy: 'tags', values: list(item.tags) };
    case 'taxonomy':
      return {
        ...rest,
        what: [],
        ...(item.taxonomy ? { filterBy: item.taxonomy } : {}),
        values: list(item.terms),
      };
    case 'session':
      return {
        ...rest,
        what: [],
        ...(item.sessionList ? { filterBy: item.sessionList } : {}),
        values: list(item.sessionTerms),
      };
    case 'type':
      return { ...rest, what: list(item.types), filterBy: 'all' };
    case 'feed':
      return { ...rest, what: [FEED] };
    default:
      return item;
  }
};

export const upgradeItems = (items) =>
  Array.isArray(items) && items.some(isOld) ? items.map(upgradeItem) : items;

/** The kinds picked, without "any". */
export const kindsOf = (item) =>
  list(item?.what).filter((kind) => kind !== ANY && kind !== FEED);

export const isFeed = (item) => list(item?.what).includes(FEED);

/**
 * "Another calendar" doesn't mix with kinds of event: whichever was picked
 * last wins (the multi-select adds to the end).
 */
export const tidyWhat = (what) => {
  const picked = list(what).filter((kind) => kind !== ANY);
  if (!picked.includes(FEED) || picked.length === 1) return picked;
  return picked[picked.length - 1] === FEED
    ? [FEED]
    : picked.filter((kind) => kind !== FEED);
};

/** Whether the item has enough to be a button (as the server decides). */
export const isFinished = (raw) => {
  const item = upgradeItem(raw);
  if (!item) return false;
  if (isFeed(item))
    return !!(typeof item.feed === 'string' && item.feed.trim());
  if (!item.filterBy) return false;
  if (item.filterBy === 'all') return kindsOf(item).length > 0;
  return list(item.values).length > 0;
};

/** What the sidebar's list calls the item, before the site's names load. */
export const itemName = (raw) => {
  const item = upgradeItem(raw);
  const label = typeof item?.label === 'string' ? item.label.trim() : '';
  if (label) return label;
  if (item?.filterBy !== 'tags') return '';
  return list(item.values)
    .filter((value) => typeof value === 'string')
    .join(', ');
};

export const nameItems = (items) =>
  items.map((item) => {
    const title = itemName(item);
    if (title === (item.title || '')) return item;
    const { title: old, ...rest } = item;
    return title ? { ...rest, title } : rest;
  });
