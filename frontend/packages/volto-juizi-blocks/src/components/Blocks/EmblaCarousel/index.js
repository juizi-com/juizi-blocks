import makeBlockEdit from '../../BlockEdit/BlockEdit';
import { withItemTitles } from '../_shared/items';
import EmblaCarouselView from './View';
import emblaCarouselSchema from './schema';

// Defaults seeded when a display style is chosen for the first time. No
// text tone: it follows the background colour (see View.jsx).
const initialData = (displayMode) => ({
  displayMode,
  loop: true,
  slidesToShow: 1,
  minSlidesOnMobile: 1,
  arrowPosition: 'bottom',
  alignment: 'left',
  ...(displayMode === 'logo-marquee'
    ? {
        marqueeSpeed: 20,
        logoHeight: 48,
        logoGap: 32,
        logoPadding: 8,
        pauseOnHover: true,
      }
    : {}),
});

const getChangedData = (id, value, data) =>
  id === 'displayMode' && !data.displayMode
    ? { ...data, ...initialData(value) }
    : { ...data, [id]: value };

// Slides store their link as a single object (the object browser edits an
// array), and are named in the sidebar list after their heading.
const normalizeData = (data) =>
  Array.isArray(data.slides)
    ? {
        ...data,
        slides: withItemTitles(
          data.slides.map((slide) => ({
            ...slide,
            link: Array.isArray(slide.link) ? slide.link[0] : slide.link,
          })),
          'heading',
        ),
      }
    : data;

const getFormData = (data) => ({
  ...data,
  slides: Array.isArray(data.slides)
    ? data.slides.map((slide) => ({
        ...slide,
        link: Array.isArray(slide.link)
          ? slide.link
          : slide.link
            ? [slide.link]
            : [],
      }))
    : [],
});

export const EmblaCarouselEdit = makeBlockEdit(EmblaCarouselView, {
  getChangedData,
  normalizeData,
  getFormData,
  // These choices rebuild the sidebar's fields, so the form remounts.
  formKey: (data) =>
    `listing-${data.useListing ? 'on' : 'off'}-mode-${data.displayMode || 'none'}-append-${data.appendManualSlides ? 'on' : 'off'}`,
});
export { EmblaCarouselView, emblaCarouselSchema };
