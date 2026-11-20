/**
 * Which headings on a page become the Hero's TOC buttons.
 *
 * Only section headings: the ones an editor types as text, and each block's
 * own title. Never the titles of the things a block shows (carousel slides,
 * news items in a listing, cards in a content row, accordion panels): a
 * page with a news carousel would otherwise get a button per news item.
 *
 * Works from the rendered page (view and edit mode alike), without knowing
 * any block's schema:
 * - a heading outside any block, or in a text block (slate, text, heading),
 *   counts;
 * - listing, search and teaser blocks show other content's titles, so only
 *   their headline (`.headline`) counts;
 * - in any other block, only its first heading counts (the block's title),
 *   and not if it sits in a repeated item (a slide, card or list entry: an
 *   element with an identical sibling that has the same kind of heading);
 * - hidden headings (collapsed panels, `hidden`, `aria-hidden`) and anything
 *   marked `data-no-toc` never count. A block can mark its own sub-headings
 *   `data-no-toc` (e.g. a map's "All places" list).
 */

const TEXT_BLOCKS = ['slate', 'text', 'heading'];
const ITEM_BLOCKS = ['listing', 'search', 'teaser'];
const ANY_HEADING = 'h1, h2, h3, h4, h5, h6';

const hasClass = (el, names) => names.some((n) => el.classList.contains(n));

// Inside a slide, card or list entry: some element between the heading and
// its block is an <li>, or has a twin beside it (same tag and classes)
// holding the same level of heading.
export const inRepeatedItem = (heading, block) => {
  for (let a = heading.parentElement; a && a !== block; a = a.parentElement) {
    if (a.tagName === 'LI') return true;
    const parent = a.parentElement;
    if (!parent) break;
    const twin = Array.from(parent.children).some(
      (c) =>
        c !== a &&
        c.tagName === a.tagName &&
        c.className === a.className &&
        c.querySelector(heading.tagName),
    );
    if (twin) return true;
  }
  return false;
};

export const isSectionHeading = (heading) => {
  if (heading.closest('[data-no-toc], [hidden], [aria-hidden="true"], [inert]'))
    return false;
  const block = heading.closest('.block');
  if (!block || hasClass(block, TEXT_BLOCKS)) return true;
  if (hasClass(block, ITEM_BLOCKS))
    return heading.classList.contains('headline');
  if (inRepeatedItem(heading, block)) return false;
  return block.querySelector(ANY_HEADING) === heading;
};
