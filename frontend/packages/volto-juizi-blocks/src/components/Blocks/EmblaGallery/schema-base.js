import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getContrastingColor,
} from '../../../config/colors';
import blockMessages from '../../../blocks/messages';
import {
  getAlignmentChoices,
  msToSeconds,
  withSavedChoice,
} from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

// Named choices store the same values the fields used to take as numbers;
// a saved value that isn't one of them shows as "Custom (…)". The labels are
// messages (or, for times, a number of seconds), translated in the schema.
const GAPS = [
  [0, shared.none],
  [6, shared.small],
  [12, shared.normal],
  [24, shared.large],
];
const THUMB_SIZES = [
  [60, shared.small],
  [90, shared.medium],
  [120, shared.large],
];
const PICTURE_TIMES = [4000, 6000, 8000, 10000];
const px = (value) => `${value}px`;

// ─── Schema ────────────────────────────────────────────────────────────────
// Deliberately smaller than the Carousel's schema: no per-item manual entry
// — pictures always come from the current page or a content query. If a
// manual "pick individual pictures" mode is needed later, it slots in as a
// third sourceMode alongside these two.
const emblaGallerySchema = ({ formData, intl } = {}) => {
  const t = translator(intl);
  const labelled = (choices) =>
    choices.map(([value, label]) => [value, t(label)]);
  const displayMode = formData?.displayMode || null;
  const modeSelected = !!displayMode;
  const isCarousel = displayMode === 'carousel';
  const isGrid = displayMode === 'blocks' || displayMode === 'masonry';
  const isMasonry = displayMode === 'masonry';
  const backgroundColor = formData?.backgroundColor;
  // Colours this block offers — set per block in the Juizi Blocks dashboard.
  const colors = getBlockColorList('emblaGallery');

  return {
    title: t(blockMessages.gallery),

    fieldsets: [
      // Display style first, always visible
      {
        id: 'default',
        title: t(shared.content),
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
              title: t(messages.gridLayout),
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
              title: t(messages.slideshowBehaviour),
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
              title: t(shared.appearance),
              fields: ['alignment', 'isFullWidth', 'showCaptionOnItem'],
            },
            {
              id: 'background',
              title: t(shared.background),
              fields: ['backgroundColor'],
            },
            {
              id: 'lightbox',
              title: t(messages.enlargedView),
              fields: ['enableLightbox', 'showCaptionInLightbox'],
            },
            {
              id: 'advanced',
              title: t(shared.advanced),
              fields: ['outerClassName'],
            },
          ]
        : []),
    ],

    properties: {
      // ── Display style ──────────────────────────────────────────────────
      displayMode: {
        title: t(shared.displayStyle),
        description: t(
          modeSelected ? messages.styleChangeHelp : shared.chooseStyleStart,
        ),
        type: 'string',
        // Stored values are unchanged (carousel / blocks / masonry).
        choices: [
          ['carousel', t(messages.modeSlideshow)],
          ['blocks', t(messages.modeEven)],
          ['masonry', t(messages.modeNatural)],
        ],
      },

      // ── Content ────────────────────────────────────────────────────────
      title: {
        title: t(shared.heading),
        description: t(messages.headingHelp),
        type: 'string',
      },
      description: {
        title: t(shared.introText),
        type: 'string',
      },
      sourceMode: {
        title: t(messages.source),
        description: t(messages.sourceHelp),
        type: 'string',
        choices: [
          ['context', t(messages.sourceContext)],
          ['query', t(messages.sourceQuery)],
        ],
        default: 'context',
      },
      // Injected/removed by emblaGallerySchemaEnhancer depending on sourceMode:
      contextItemTypes: {
        title: t(messages.itemTypes),
        widget: 'array',
        choices: [
          ['Image', t(messages.typeImage)],
          ['Link', t(messages.typeLink)],
        ],
        default: ['Image', 'Link'],
      },

      // ── Slideshow style ────────────────────────────────────────────────
      carouselStyle: {
        title: t(messages.slideshowStyle),
        type: 'string',
        choices: [
          ['featured', t(messages.styleFeatured)],
          ['strip', t(messages.styleStrip)],
        ],
        default: 'featured',
      },

      // ── Grid layout ────────────────────────────────────────────────────
      columnsDesktop: {
        title: t(messages.columnsDesktop),
        type: 'number',
        default: 4,
      },
      columnsTablet: {
        title: t(messages.columnsTablet),
        ...(isMasonry ? { description: t(messages.columnsTabletHelp) } : {}),
        type: 'number',
        default: 3,
      },
      columnsMobile: {
        title: t(messages.columnsMobile),
        type: 'number',
        default: 2,
      },
      gap: {
        title: t(messages.gap),
        widget: 'select',
        choices: withSavedChoice(labelled(GAPS), formData?.gap, px, t),
        default: 12,
      },

      // ── Slideshow behaviour ────────────────────────────────────────────
      loop: {
        title: t(shared.loop),
        type: 'boolean',
        default: true,
      },
      autoplay: {
        title: t(shared.autoplay),
        type: 'boolean',
        description: t(shared.autoplayReducedMotion),
      },
      autoplayDelay: {
        title: t(messages.pictureTime),
        widget: 'select',
        choices: withSavedChoice(
          PICTURE_TIMES.map((ms) => [ms, msToSeconds(ms, t)]),
          formData?.autoplayDelay,
          (ms) => msToSeconds(ms, t),
          t,
        ),
        default: 8000,
      },
      hideArrows: {
        title: t(shared.hideArrows),
        description: t(messages.hideArrowsHelp),
        type: 'boolean',
      },
      arrowPosition: {
        title: t(shared.arrowPosition),
        description: t(messages.arrowPositionHelp),
        type: 'string',
        choices: [
          ['sides', t(messages.arrowsSides)],
          ['below', t(messages.arrowsBelow)],
        ],
        default: 'sides',
      },
      rowAlignment: {
        title: t(messages.rowAlignment),
        description: t(messages.rowAlignmentHelp),
        type: 'string',
        choices: getAlignmentChoices(t),
        default: 'left',
      },
      thumbnailHeight: {
        title: t(messages.thumbSize),
        widget: 'select',
        choices: withSavedChoice(
          labelled(THUMB_SIZES),
          formData?.thumbnailHeight,
          px,
          t,
        ),
        default: 90,
      },
      activeThumbColor: {
        title: t(messages.highlight),
        description: t(messages.highlightHelp),
        widget: 'select',
        choices: withSavedChoice(
          getColorChoices(colors),
          formData?.activeThumbColor,
          (value) => (value === '#ffffff' ? t(messages.whiteEarlier) : value),
          t,
        ),
        default: getContrastingColor(backgroundColor, colors),
      },

      // ── Appearance ─────────────────────────────────────────────────────
      alignment: {
        title: t(shared.textAlignment),
        choices: getAlignmentChoices(t),
        default: 'left',
      },
      isFullWidth: {
        title: t(shared.fullWidth),
        type: 'boolean',
        default: false,
      },
      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(messages.backgroundColorHelp),
        widget: 'select',
        choices: [['transparent', t(shared.none)], ...getColorChoices(colors)],
        default: 'transparent',
      },
      arrowStyle: {
        title: t(shared.arrowStyle),
        description: t(messages.arrowStyleHelp),
        widget: 'select',
        choices: [
          ['default', t(shared.standard)],
          ...getButtonChoices(colors, t),
        ],
        default: 'default',
      },
      showCaptionOnItem: {
        title: t(messages.captionOnItem),
        description: t(messages.captionOnItemHelp),
        type: 'boolean',
        default: false,
      },
      outerClassName: {
        title: t(shared.customClass),
        type: 'string',
      },

      // ── Enlarged view ──────────────────────────────────────────────────
      enableLightbox: {
        title: t(messages.enableLightbox),
        description: t(messages.enableLightboxHelp),
        type: 'boolean',
        default: true,
      },
      showCaptionInLightbox: {
        title: t(messages.captionInLightbox),
        type: 'boolean',
        default: false,
      },
    },

    required: [],
  };
};

export default emblaGallerySchema;
