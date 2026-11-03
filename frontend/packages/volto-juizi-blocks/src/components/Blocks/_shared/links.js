/**
 * Link helpers shared by every Juizi block.
 *
 * Block data stores links in several shapes, depending on the widget and on
 * which add-on generation saved it: an object browser array
 * (`[{ '@id': … }]`), a single object, or a plain URL string (older Redirect
 * blocks). `getHref` accepts all of them.
 *
 * Nothing here reads `window`, so the same answer comes out on the server
 * and in the browser.
 */
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';

const PORTAL_URL = /\$\{portal_url\}/g;

/**
 * The URL a link points to, ready for an `href`, or '' when there is no
 * usable link (so callers can tell "no link" apart from a real one).
 * - File items link to their download (once: visitors may already be
 *   given the download address). With `{ preview: true }` they link to
 *   Plone's display view instead, which the browser shows when it can (a
 *   PDF) and downloads otherwise (a spreadsheet).
 * - Link items (from the object browser or a query) follow their remoteUrl.
 */
/** The site root flattens to '': keep it as a link to the home page. */
const appHref = (url) => flattenToAppURL(url) || '/';

export const getHref = (link, { preview = false } = {}) => {
  const item = Array.isArray(link) ? link[0] : link;
  if (!item) return '';
  if (typeof item === 'string') {
    const url = item.trim();
    return url ? appHref(url) : '';
  }
  if (typeof item !== 'object') return '';
  if (item['@type'] === 'Link' && item.remoteUrl) {
    return appHref(item.remoteUrl.replace(PORTAL_URL, ''));
  }
  const id = item['@id'];
  if (!id || typeof id !== 'string') return '';
  const url = appHref(id);
  // plone.restapi already gives visitors who can't edit the file its
  // download address (IObjectPrimaryFieldTarget); editors get the item.
  if (url.includes('/@@download/')) {
    return preview ? url.replace('/@@download/', '/@@display-file/') : url;
  }
  if (item['@type'] !== 'File') return url;
  return `${url}/${preview ? '@@display-file' : '@@download'}/file`;
};

/** True for http(s) URLs that leave this site. Relative paths, anchors,
 * mailto: and tel: links are not "external" (they don't open a new tab). */
export const isExternalHref = (href) => {
  if (!href || typeof href !== 'string') return false;
  if (!/^(https?:)?\/\//i.test(href)) return false;
  // Volto's isInternalURL treats anything starting with '/' as internal,
  // including protocol-relative '//other.org' URLs: give those a scheme.
  return !isInternalURL(href.startsWith('//') ? `https:${href}` : href);
};

/** Props for an <a> that opens external links in a new tab. */
export const externalLinkProps = (href) =>
  isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

/** Props for an <a>: a new tab when the editor asked for one, or when the
 * link leaves the site. */
export const linkTargetProps = (href, openInNewTab = false) =>
  openInNewTab && href
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : externalLinkProps(href);
