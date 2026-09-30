import makeBlockEdit from '../../BlockEdit/BlockEdit';
import { withItemTitles } from '../_shared/items';
import HeroView from './View';
import HeroSchema from './schema';
import './style.css';

// Auto-fill a button's label from its link's title if the editor left it
// blank, and name each button in the sidebar list after its label.
const autoFillButtonLabels = (buttons = []) =>
  withItemTitles(
    buttons.map((btn) => {
      const link = Array.isArray(btn.link) ? btn.link[0] : btn.link;
      const label = btn.label?.trim();
      if (!label && link && (link.title || link['@id'])) {
        return {
          ...btn,
          label: link.title || link['@id'].split('/').filter(Boolean).pop(),
        };
      }
      return btn;
    }),
    'label',
  );

// Initialise block data when a display style is first selected.
// Only runs once — never overwrites existing data.
const getInitialDataForMode = (mode) => {
  if (mode === 'hero') {
    return {
      blockMode: 'hero',
      usePageTitle: true,
      usePageDescription: true,
      alignment: 'left',
      buttonsDisplayMode: 'buttons',
      // Default true: a hero is almost always the primary page heading.
      // The editor can uncheck this if multiple heroes are on the page
      // or if another element carries the h1.
      isPrimaryHeading: true,
      hideTitle: false,
    };
  }
  if (mode === 'section') {
    return {
      blockMode: 'section',
      // A mid-page band has its own heading: the title and description
      // fields show straight away (and nothing is seeded that could be
      // published by accident). The page-title switches stay available.
      usePageTitle: false,
      usePageDescription: false,
      backgroundColor: 'transparent',
      alignment: 'left',
      buttonsDisplayMode: 'buttons',
      // Default false for section: mid-page bands are rarely the primary
      // page heading. The editor can enable this when appropriate.
      isPrimaryHeading: false,
      hideTitle: false,
    };
  }
  return {};
};

const getChangedData = (id, value, data) => {
  // When the display style is selected for the first time, seed defaults.
  if (id === 'blockMode' && !data.blockMode) {
    return { ...data, ...getInitialDataForMode(value) };
  }

  // Side image occupies the same "beside content" slot the logo can use.
  // On first selection, seed sensible defaults (only fills blanks), and if
  // the logo was sitting beside the content, move it back above the title
  // so the two don't collide in the same slot.
  if (id === 'sideImage') {
    const updated = { ...data, sideImage: value };
    const hasImage = Array.isArray(value) && value.length > 0;
    if (hasImage) {
      if (!data.sideImageAlignment) updated.sideImageAlignment = 'middle';
      if (!data.sideImageMobile) updated.sideImageMobile = 'below';
      if (data.logoPosition === 'beside-content') {
        updated.logoPosition = 'above-title';
      }
    }
    return updated;
  }

  return { ...data, [id]: value };
};

// Applied to every change, from single fields and from the whole form.
const normalizeData = (data) =>
  data.buttons
    ? { ...data, buttons: autoFillButtonLabels(data.buttons) }
    : data;

export const HeroEdit = makeBlockEdit(HeroView, {
  getChangedData,
  normalizeData,
});
export { HeroView, HeroSchema };
