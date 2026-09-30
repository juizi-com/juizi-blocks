import makeBlockEdit from '../../BlockEdit/BlockEdit';
import EmblaGalleryView from './View';
import emblaGallerySchema from './schema';

// Defaults seeded when a display style is chosen for the first time. No
// text tone: it follows the background colour (see View.jsx).
const initialData = (displayMode) => ({
  displayMode,
  sourceMode: 'context',
  contextItemTypes: ['Image', 'Link'],
  loop: true,
  alignment: 'left',
  showCaptionOnItem: false,
  showCaptionInLightbox: false,
  enableLightbox: true,
  ...(displayMode === 'carousel' ? { carouselStyle: 'featured' } : {}),
  ...(displayMode === 'blocks' || displayMode === 'masonry'
    ? {
        columnsDesktop: 4,
        columnsTablet: 3,
        columnsMobile: 2,
        gap: 12,
        // Even grids crop every picture to the same square.
        ...(displayMode === 'blocks' ? { equalHeight: true } : {}),
      }
    : {}),
});

const getChangedData = (id, value, data) =>
  id === 'displayMode' && !data.displayMode
    ? { ...data, ...initialData(value) }
    : { ...data, [id]: value };

export const EmblaGalleryEdit = makeBlockEdit(EmblaGalleryView, {
  getChangedData,
  // These choices rebuild the sidebar's fields, so the form remounts.
  formKey: (data) =>
    `gallery-source-${data.sourceMode || 'context'}-mode-${data.displayMode || 'none'}`,
});
export { EmblaGalleryView, emblaGallerySchema };
