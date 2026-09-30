/**
 * Where a Redirect block sends visitors, and whether that's the page it's
 * on (which would send them round in circles).
 */
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { getHref } from '../_shared/links';

/** Path without query, hash or trailing slash, for comparing pages. */
const normalisePath = (url = '') =>
  flattenToAppURL(url).split(/[?#]/)[0].replace(/\/+$/, '') || '/';

export const getRedirectUrl = (data) => getHref(data?.url);

export const isSamePage = (url, contentId) =>
  !!url && !!contentId && normalisePath(url) === normalisePath(contentId);

// ─── Loop breaker ──────────────────────────────────────────────────────────
// Remembers, per browser tab, which pages redirected the visitor in the last
// few seconds. A page that would redirect them a second time is shown
// instead (two pages redirecting to each other).

const STORAGE_KEY = 'juizi-redirects';
const WINDOW_MS = 10000;

const readRecent = (now) => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((entry) => now - entry.time < WINDOW_MS)
      : [];
  } catch (e) {
    return [];
  }
};

/** True when this page already redirected the visitor moments ago. */
export const isRedirectLoop = (path, now = Date.now()) =>
  readRecent(now).some((entry) => entry.path === normalisePath(path));

/** Records that this page is redirecting the visitor now. */
export const rememberRedirect = (path, now = Date.now()) => {
  try {
    const list = [...readRecent(now), { path: normalisePath(path), time: now }];
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // Storage unavailable (private mode, blocked): redirect as normal.
  }
};
