/**
 * Helpers for list fields (object_list): slides, cards, buttons.
 */

const plainText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  // Rich text ({ data: [...] } slate or { data: '<p>…' } draft) → skip.
  return '';
};

/**
 * Names each item in the sidebar list after one of its own fields.
 *
 * VLT's list widget (object_list) shows `item.title`, or "{Item} #n" when
 * there is none; it doesn't support a `titleField` option. Rather than asking
 * editors for a separate label they must keep in sync, `title` is filled in
 * from the item's heading (or label) whenever the list changes. The field
 * isn't shown in the item form. Items without that field keep any title they
 * already have, and new ids are never needed here (see ensureIds).
 */
export const withItemTitles = (items, ...fields) =>
  Array.isArray(items)
    ? items.map((item) => {
        if (!item || typeof item !== 'object') return item;
        const name = fields.map((f) => plainText(item[f])).find(Boolean);
        return name && name !== item.title ? { ...item, title: name } : item;
      })
    : items;

/** Gives every list item the '@id' the sortable list widget needs, and
 * drops empty entries. */
/** An id for items saved without one (older content): the same on every
 * render, so the sidebar list can follow them, and kept once saved. */
export const withStableIds = (items, prefix = 'item') =>
  Array.isArray(items)
    ? items.map((item, index) =>
        item && typeof item === 'object' && !item['@id']
          ? { ...item, '@id': `${prefix}-saved-${index}` }
          : item,
      )
    : items;

export const ensureIds = (items, prefix = 'item') =>
  (items || []).filter(Boolean).map((item) =>
    item['@id']
      ? item
      : {
          ...item,
          '@id': `${prefix}-${Math.random().toString(36).slice(2, 9)}`,
        },
  );
