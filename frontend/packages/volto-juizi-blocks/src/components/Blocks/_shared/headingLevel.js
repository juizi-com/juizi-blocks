/**
 * Heading levels that never skip one, without changing how pages look.
 *
 * Each block was built with fixed tags: its title an <h2>, its items
 * (cards, slides, tiers) <h3>. That reads well under a section heading,
 * but a block placed straight after the page title (an <h1>) with no title
 * of its own gives h1 → h3, and screen reader users, who move through a
 * page by its headings, hear a level missing.
 *
 * The fix keeps every tag (so the theme's h2/h3 styles still apply and no
 * page changes on screen) and corrects the level screen readers hear with
 * `aria-level`, only where the fixed level would skip:
 *
 *   level = min(designed level, previous heading's level + 1)
 *
 * and a block's item headings sit one level below its own title when it has
 * one. The previous heading is worked out from the page's saved blocks
 * (`properties`), so the server and the browser agree (no hydration
 * mismatch) and edit mode matches the published page. When the block can't
 * be found in the page's top-level blocks (inside a grid, say), nothing is
 * changed.
 */

import { createContext, useContext } from 'react';

const HEADING_TYPES = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

// The last heading level inside a slate value, or 0.
const lastSlateHeading = (nodes) => {
  let last = 0;
  (nodes || []).forEach((n) => {
    if (n && HEADING_TYPES[n.type]) last = HEADING_TYPES[n.type];
    if (n?.children) {
      const inner = lastSlateHeading(n.children);
      if (inner) last = inner;
    }
  });
  return last;
};

const text = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * The level of the last heading a saved block puts on the page, given the
 * level before it; `prev` when it adds none. Blocks with a title of their
 * own count as their title's level (items below it are deeper, which only
 * matters for blocks designed deeper than h3, and none are).
 */
export const blockLastHeading = (block, prev) => {
  if (!block) return prev;
  const type = block['@type'];
  if (type === 'title') return 1;
  if (type === 'slate') return lastSlateHeading(block.value) || prev;
  if (type === 'heading') return HEADING_TYPES[block.tag] || 2;
  if (type === 'juiziHero') {
    if (block.isPrimaryHeading) return 1;
    return text(block.title) ? Math.min(2, prev + 1) : prev;
  }
  // Any other block with a title or headline of its own (Juizi blocks,
  // VLT listing/search/grid headlines).
  if (
    text(block.title) ||
    text(block.headline) ||
    text(block.heading) ||
    text(block.headerText)
  )
    return Math.min(2, prev + 1);
  return prev;
};

/** The level of the last heading before `blockId` on the page, or null. */
export const previousHeadingLevel = (properties, blockId) => {
  const blocks = properties?.blocks;
  const items = properties?.blocks_layout?.items;
  if (!blocks || !Array.isArray(items) || !blockId) return null;
  const at = items.indexOf(blockId);
  if (at < 0) return null;
  // Every content page has its title as the <h1>, shown by a title block or
  // by the page itself.
  let prev = 1;
  items.slice(0, at).forEach((id) => {
    prev = blockLastHeading(blocks[id], prev);
  });
  return prev;
};

/**
 * Levels for a block's headings: { title, item }.
 *   designedTitle  the title's tag level (2 for most blocks)
 *   designedItem   the items' tag level (3)
 *   hasTitle       whether the block shows its title
 */
export const headingLevels = (
  properties,
  blockId,
  { designedTitle = 2, designedItem = 3, hasTitle = false } = {},
) => {
  const prev = previousHeadingLevel(properties, blockId);
  if (prev === null) return { title: designedTitle, item: designedItem };
  const title = Math.min(designedTitle, prev + 1);
  const item = hasTitle
    ? Math.min(designedItem, title + 1)
    : Math.min(designedItem, prev + 1);
  return { title, item };
};

/** `aria-level` for a heading whose tag is `tagLevel`, only when it differs. */
export const levelAttrs = (level, tagLevel) =>
  level && level !== tagLevel ? { 'aria-level': level } : {};

/** The block's id, whichever prop carries it (view: `id`, edit: `block`). */
export const blockIdOf = (props) => props?.block || props?.id;

/**
 * For item components rendered deep inside a block: the block provides the
 * attributes for its item headings, each item spreads them on its <h3>.
 */
export const ItemHeadingContext = createContext({});
export const useItemHeadingAttrs = () => useContext(ItemHeadingContext);
