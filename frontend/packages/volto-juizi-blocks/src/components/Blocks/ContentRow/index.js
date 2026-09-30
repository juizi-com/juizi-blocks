import makeBlockEdit from '../../BlockEdit/BlockEdit';
import { ensureIds, withItemTitles } from '../_shared/items';
import ContentRowView from './View';
import ContentRowSchema from './schema';
import './style.css';

// Layout defaults per display style, applied when a style is chosen.
const layoutDefaults = {
  numbered: { columns: 3, headerAlignment: 'left', itemsAlignment: 'left' },
  statistics: {
    columns: 3,
    headerAlignment: 'center',
    itemsAlignment: 'center',
    statsFormatK: false,
    statAnimationMs: 2000,
  },
  icon: { columns: 4, headerAlignment: 'center', itemsAlignment: 'center' },
  card: {
    columns: 3,
    headerAlignment: 'left',
    itemsAlignment: 'left',
    overlayStyle: 'gradient',
  },
};

// When switching style, keep only the editor's own shared content (heading,
// text, link). Nothing is seeded: an empty row shows the "add your first
// item" prompt instead of example text that could be published by accident.
const migrateItems = (items) =>
  (items || []).filter(Boolean).map((existing) => ({
    '@id': existing['@id'],
    ...(existing.heading ? { heading: existing.heading } : {}),
    ...(existing.text ? { text: existing.text } : {}),
    ...(existing.link ? { link: existing.link } : {}),
  }));

const getChangedData = (id, value, data) => {
  if (id === 'displayMode') {
    const isFirstSelect = !data.displayMode;
    return {
      ...data,
      displayMode: value,
      ...layoutDefaults[value],
      items: isFirstSelect ? [] : migrateItems(data.items),
    };
  }
  return { ...data, [id]: value };
};

// Every change: items get ids (the sortable list needs them) and are named
// in the sidebar after their heading (statistics: label).
const normalizeData = (data) =>
  data.items
    ? {
        ...data,
        items: withItemTitles(ensureIds(data.items), 'heading', 'label'),
      }
    : data;

export const ContentRowEdit = makeBlockEdit(ContentRowView, {
  getChangedData,
  normalizeData,
  getFormData: (data) => ({ ...data, items: ensureIds(data.items) }),
  // Remount the sidebar only when the style changes (its item form differs),
  // not when items are added or removed.
  formKey: (data) => `contentrow-${data.displayMode || 'none'}`,
});
export { ContentRowView, ContentRowSchema };
