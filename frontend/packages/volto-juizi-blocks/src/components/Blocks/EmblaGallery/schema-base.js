import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getContrastingColor,
} from '../../../config/colors';
import {
  alignmentChoices,
  msToSeconds,
  withSavedChoice,
} from '../_shared/choices';

// Named choices store the same values the fields used to take as numbers;
// a saved value that isn't one of them shows as "Custom (…)".
const GAPS = [
  [0, 'None'],
  [6, 'Small'],
  [12, 'Normal'],
  [24, 'Large'],
];
const THUMB_SIZES = [
  [60, 'Small'],
  [90, 'Medium'],
  [120, 'Large'],
];
const PICTURE_TIMES = [
  [4000, '4 seconds'],
  [6000, '6 seconds'],
  [8000, '8 seconds'],
  [10000, '10 seconds'],
];
const px = (value) => `${value}px`;

// ─── Schema ────────────────────────────────────────────────────────────────
// Deliberately smaller than the Carousel's schema: no per-item manual entry
// — pictures always come from the current page or a content query. If a
// manual "pick individual pictures" mode is needed later, it slots in as a
// third sourceMode alongside these two.
const emblaGallerySchema = ({ formData } = {}) => {
  const displayMode = formData?.displayMode || null;
  const modeSelected = !!displayMode;
  const isCarousel = displayMode === 'carousel';
  const isGrid = displayMode === 'blocks' || displayMode === 'masonry';
  const isMasonry = displayMode === 'masonry';
  const backgroundColor = formData?.backgroundColor;
  // Colours this block offers — set per block in the Juizi Blocks dashboard.
  const colors = getBlockColorList('emblaGallery');

  return {
    title: 'Gallery',

    fieldsets: [
      // Display style first, always visible
      {
        id: 'default',
        title: 'Content',
        fields: [
          'displayMode',
          ...(modeSelected ? ['sourceMode', 'title', 'description'] : []),
          ...(modeSelected && isCarousel ? ['carouselStyle'] : []),
        ],
      },

      // Grid layout — even and natural grids only
      ...(modeSelected && isGrid
        ? [
            {
              id: 'layout',
              title: 'Grid layout',
              fields: [
                'columnsDesktop',
                'columnsTablet',
                // Natural grids always show one column on phones, so
                // pictures stay in reading order.
                ...(isMasonry ? [] : ['columnsMobile']),
                'gap',
              ],
            },
          ]
        : []),

      // Slideshow behaviour — slideshow only
      ...(modeSelected && isCarousel
        ? [
            {
              id: 'carousel',
              title: 'Slideshow behaviour',
              fields: [
                'loop',
                'autoplay',
                ...(formData?.autoplay ? ['autoplayDelay'] : []),
                'hideArrows',
                ...(formData?.hideArrows
                  ? []
                  : ['arrowPosition', 'arrowStyle']),
                'thumbnailHeight',
                'rowAlignment',
                ...(formData?.carouselStyle === 'strip'
                  ? []
                  : ['activeThumbColor']),
              ],
            },
          ]
        : []),

      ...(modeSelected
        ? [
            {
              id: 'appearance',
              title: 'Appearance',
              fields: ['alignment', 'isFullWidth', 'showCaptionOnItem'],
            },
            {
              id: 'background',
              title: 'Background',
              fields: ['backgroundColor'],
            },
            {
              id: 'lightbox',
              title: 'Enlarged view',
              fields: ['enableLightbox', 'showCaptionInLightbox'],
            },
            {
              id: 'advanced',
              title: 'Advanced',
              fields: ['outerClassName'],
            },
          ]
        : []),
    ],

    properties: {
      // ── Display style ──────────────────────────────────────────────────
      displayMode: {
        title: 'Display style',
        description: modeSelected
          ? 'Changing style may affect how the pictures are presented.'
          : 'Choose a display style to get started.',
        type: 'string',
        // Stored values are unchanged (carousel / blocks / masonry).
        choices: [
          ['carousel', 'Slideshow'],
          ['blocks', 'Even grid'],
          ['masonry', 'Natural grid'],
        ],
      },

      // ── Content ────────────────────────────────────────────────────────
      title: {
        title: 'Heading',
        description:
          'Optional heading shown above the gallery. Screen readers use it to name this section.',
        type: 'string',
      },
      description: {
        title: 'Intro text',
        type: 'string',
      },
      sourceMode: {
        title: 'Where the pictures come from',
        description:
          "'Pictures inside this page' shows the pictures stored in this page. 'Pictures from across the site' finds them using rules you set.",
        type: 'string',
        choices: [
          ['context', 'Pictures inside this page'],
          ['query', 'Pictures from across the site'],
        ],
        default: 'context',
      },
      // Injected/removed by emblaGallerySchemaEnhancer depending on sourceMode:
      contextItemTypes: {
        title: 'What counts as a picture',
        widget: 'array',
        choices: [
          ['Image', 'Pictures'],
          ['Link', 'Links that have a preview picture'],
        ],
        default: ['Image', 'Link'],
      },

      // ── Slideshow style ────────────────────────────────────────────────
      carouselStyle: {
        title: 'Slideshow style',
        type: 'string',
        choices: [
          ['featured', 'Large picture with small pictures below'],
          ['strip', 'Row of small pictures only'],
        ],
        default: 'featured',
      },

      // ── Grid layout ────────────────────────────────────────────────────
      columnsDesktop: {
        title: 'Columns on large screens',
        type: 'number',
        default: 4,
      },
      columnsTablet: {
        title: 'Columns on tablets',
        ...(isMasonry
          ? {
              description:
                'Phones always show one column, so pictures stay in order.',
            }
          : {}),
        type: 'number',
        default: 3,
      },
      columnsMobile: {
        title: 'Columns on phones',
        type: 'number',
        default: 2,
      },
      gap: {
        title: 'Space between pictures',
        widget: 'select',
        choices: withSavedChoice(GAPS, formData?.gap, px),
        default: 12,
      },

      // ── Slideshow behaviour ────────────────────────────────────────────
      loop: {
        title: 'Loop continuously',
        type: 'boolean',
        default: true,
      },
      autoplay: {
        title: 'Autoplay',
        type: 'boolean',
        description:
          'Automatically turned off for visitors who have asked their device to reduce motion.',
      },
      autoplayDelay: {
        title: 'Time on each picture',
        widget: 'select',
        choices: withSavedChoice(
          PICTURE_TIMES,
          formData?.autoplayDelay,
          msToSeconds,
        ),
        default: 8000,
      },
      hideArrows: {
        title: 'Hide arrows',
        description:
          'The row of small pictures only shows arrows when there are more pictures than fit across.',
        type: 'boolean',
      },
      arrowPosition: {
        title: 'Arrow position',
        description:
          'On phones the arrows always sit below the pictures, whatever you choose here, so they are easy to reach with a thumb.',
        type: 'string',
        choices: [
          ['sides', 'On each side of the pictures'],
          ['below', 'Below the pictures'],
        ],
        default: 'sides',
      },
      rowAlignment: {
        title: 'Small pictures alignment',
        description:
          'Where the row of small pictures sits when they all fit across. Once there are more than fit, they scroll from the left.',
        type: 'string',
        choices: alignmentChoices,
        default: 'left',
      },
      thumbnailHeight: {
        title: 'Size of the small pictures',
        widget: 'select',
        choices: withSavedChoice(THUMB_SIZES, formData?.thumbnailHeight, px),
        default: 90,
      },
      activeThumbColor: {
        title: 'Highlight around the current picture',
        description:
          'Marks the small picture that matches the large one shown.',
        widget: 'select',
        choices: withSavedChoice(
          getColorChoices(colors),
          formData?.activeThumbColor,
          (value) => (value === '#ffffff' ? 'White, earlier setting' : value),
        ),
        default: getContrastingColor(backgroundColor, colors),
      },

      // ── Appearance ─────────────────────────────────────────────────────
      alignment: {
        title: 'Text alignment',
        choices: alignmentChoices,
        default: 'left',
      },
      isFullWidth: {
        title: 'Full width',
        type: 'boolean',
        default: false,
      },
      backgroundColor: {
        title: 'Background colour',
        description: 'Text colour follows it automatically.',
        widget: 'select',
        choices: [['transparent', 'None'], ...getColorChoices(colors)],
        default: 'transparent',
      },
      arrowStyle: {
        title: 'Arrow style',
        description:
          'Standard: dark arrows over the pictures on the sides, outlined arrows below. Or pick a colour to match your buttons. Also used in the enlarged view.',
        widget: 'select',
        choices: [['default', 'Standard'], ...getButtonChoices(colors)],
        default: 'default',
      },
      showCaptionOnItem: {
        title: 'Show picture titles on the page',
        description:
          "Shows each picture's title on the small picture or grid picture itself",
        type: 'boolean',
        default: false,
      },
      outerClassName: {
        title: 'Extra style name (for your web team)',
        type: 'string',
      },

      // ── Enlarged view ──────────────────────────────────────────────────
      enableLightbox: {
        title: 'Enlarge pictures when clicked',
        description: 'When off, clicking a picture opens its own page.',
        type: 'boolean',
        default: true,
      },
      showCaptionInLightbox: {
        title: 'Show picture titles in the enlarged view',
        type: 'boolean',
        default: false,
      },
    },

    required: [],
  };
};

export default emblaGallerySchema;
