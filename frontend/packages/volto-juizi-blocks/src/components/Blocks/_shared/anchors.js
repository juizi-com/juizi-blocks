/**
 * Anchor ids for blocks and headings.
 */

/** Lower-case, dash-separated slug of a heading. '' when nothing is left. */
export const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

/**
 * A block's anchor id for same-page links: the heading's slug plus the
 * first 6 characters of the block id, so two blocks with the same heading
 * on one page still get different ids. `fallback` is used with no heading.
 */
export const blockAnchorId = (heading, blockId, fallback) => {
  const suffix = blockId ? `-${String(blockId).slice(0, 6)}` : '';
  const slug = slugify(heading);
  if (slug) return `${slug}${suffix}`;
  return fallback ? `${fallback}${suffix}` : undefined;
};
