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
 * - File items link to their download.
 * - Link items (from the object browser or a query) follow their remoteUrl.
 */
/** The site root flattens to '': keep it as a link to the home page. */
const appHref = (url) => flattenToAppURL(url) || '/';

export const getHref = (link) => {
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
  return item['@type'] === 'File' ? `${url}/@@download/file` : url;
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
