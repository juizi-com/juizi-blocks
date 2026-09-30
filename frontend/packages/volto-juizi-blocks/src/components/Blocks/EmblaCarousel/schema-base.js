import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import {
  alignmentChoices,
  msToSeconds,
  withSavedChoice,
} from '../_shared/choices';

// ─── Condition helpers ─────────────────────────────────────────────────────
const isContentMode = (formData) =>
  formData?.displayMode === 'full' || formData?.displayMode === 'image-top';
const isImageTopMode = (formData) => formData?.displayMode === 'image-top';
// Styles where the picture itself sets the slide's size (the text-overlay
// style uses the picture as a background, so its height follows the text).
const hasPictureShape = (formData) =>
  formData?.displayMode === 'image-only' || isImageTopMode(formData);

// Named choices store the same values the fields used to take as numbers;
// a saved value that isn't one of them shows as "Custom (…)".
const SLIDE_TIMES = [
  [4000, '4 seconds'],
  [6000, '6 seconds'],
  [8000, '8 seconds'],
  [10000, '10 seconds'],
];
const MARQUEE_SPEEDS = [
  [30, 'Slow'],
  [20, 'Normal'],
  [12, 'Fast'],
];
const LOGO_SIZES = [
  [32, 'Small'],
  [48, 'Medium'],
  [64, 'Large'],
];
const LOGO_GAPS = [
  [16, 'Tight'],
  [32, 'Normal'],
  [48, 'Wide'],
];
const LOGO_PADDINGS = [
  [4, 'Small'],
  [8, 'Normal'],
  [16, 'Large'],
];
// Stored as "width:height"; View.jsx turns it into a CSS aspect-ratio.
// Strings, so the select keeps the value exactly as chosen.
const PICTURE_SHAPES = [
  ['original', 'As uploaded'],
  ['16:9', 'Wide (16:9)'],
  ['3:2', 'Landscape (3:2)'],
  ['4:3', 'Standard (4:3)'],
  ['1:1', 'Square (1:1)'],
  ['3:4', 'Portrait (3:4)'],
];
const px = (value) => `${value}px`;
const seconds = (value) => `${value} seconds`;

// ─── Schema ────────────────────────────────────────────────────────────────
const emblaCarouselSchema = ({ formData } = {}) => {
  const displayMode = formData?.displayMode || null;
  const modeSelected = !!displayMode;
  const isLogoMarquee = displayMode === 'logo-marquee';
  const backgroundColor = formData?.backgroundColor;
  const hasBackgroundImage = !!(Array.isArray(formData?.backgroundImage)
    ? formData.backgroundImage[0]
    : formData?.backgroundImage);
  // Filter buttons come from the tags on pages found by the content query;
  // shown for manual carousels only when already set (saved content).
  const showFilterTags = !!(formData?.useListing || formData?.filterTags);
  // Colours this block offers — set per block in the Juizi Blocks dashboard.
  const colors = getBlockColorList('emblaCarousel');

  return {
    title: 'Carousel',

    fieldsets: [
      // Display style first, always visible
      {
        id: 'default',
        title: 'Content',
        fields: [
          'displayMode',
          // Everything below only shown once a style is selected
          ...(modeSelected
            ? [
                'title',
                'description',
                'useListing',
                ...(showFilterTags ? ['filterTags'] : []),
              ]
            : []),
        ],
      },

      // Card layout — shown once a style is selected, not for the logo strip
      ...(modeSelected && !isLogoMarquee
        ? [
            {
              id: 'card',
              title: 'Card layout',
              fields: [
                'slideButtonStyle',
                'slideButtonLinkStyle',
                ...(isContentMode(formData)
                  ? ['dateDisplay', 'hideDescription', 'hideButtons']
                  : []),
                ...(isImageTopMode(formData) ? ['hideCardImage'] : []),
                ...(hasPictureShape(formData) ? ['imageAspectRatio'] : []),
                'clickableSlides',
                'equalHeight',
              ],
            },
            {
              id: 'behaviour',
              title: 'Scrolling & behaviour',
              fields: [
                'slidesToShow',
                'minSlidesOnMobile',
                'loop',
                'autoplay',
                ...(formData?.autoplay ? ['autoplayDelay'] : []),
              ],
            },
            {
              id: 'navigation',
              title: 'Navigation',
              fields: [
                'arrowPosition',
                'arrowStyle',
                'moreButtonPosition',
                'headerLinkText',
                ...(formData?.headerLinkText
                  ? ['headerLinkUrl', 'headerLinkStyle']
                  : []),
                ...(formData?.headerLinkText &&
                formData?.moreButtonPosition === 'bottom'
                  ? ['moreButtonAlign']
                  : []),
                'hideArrows',
                'hideDots',
              ],
            },
          ]
        : []),

      // Logo strip options — only for the scrolling logo strip
      ...(isLogoMarquee
        ? [
            {
              id: 'marquee',
              title: 'Logo strip',
              fields: [
                'marqueeSpeed',
                'logoHeight',
                'logoGap',
                'logoPadding',
                'logoAlignment',
                'pauseOnHover',
              ],
            },
          ]
        : []),

      ...(modeSelected
        ? [
            {
              id: 'appearance',
              title: 'Appearance',
              fields: ['alignment', 'isFullWidth'],
            },
            {
              id: 'background',
              title: 'Background',
              fields: [
                'backgroundImage',
                'backgroundColor',
                ...(hasBackgroundImage ? ['textTone'] : []),
                'slideBackgroundColor',
              ],
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
        description: !modeSelected
          ? 'Choose a display style to get started.'
          : isLogoMarquee
            ? "Only each slide's picture is shown, as a logo. Give a slide a link to make its logo clickable."
            : 'Changing style may affect how content is presented.',
        type: 'string',
        choices: [
          ['full', 'Image with text overlay'],
          ['image-only', 'Image only'],
          ['image-top', 'Image above content'],
          ['logo-marquee', 'Scrolling logo strip'],
        ],
      },

      // ── Content ────────────────────────────────────────────────────────
      title: {
        title: 'Heading',
        description:
          'Optional heading shown above the carousel. Screen readers use it to name this section, so even a short heading helps.',
        type: 'string',
      },
      description: {
        title: 'Intro text',
        description:
          'Optional text shown below the heading, above the carousel',
        type: 'string',
      },
      useListing: {
        title: 'Fill automatically from site content',
        description:
          'Shows pages that match rules you set, instead of slides you add one by one.',
        type: 'boolean',
        default: false,
      },
      filterTags: {
        title: 'Filter buttons by tag',
        description:
          "Tags, separated by commas, e.g. News, Events. Each tag becomes a button above the carousel, plus 'All'. Uses the tags set on each page.",
        type: 'string',
      },
      slides: {
        title: 'Slides',
        widget: 'object_list',
        schema: {
          title: 'Slide',
          fieldsets: [
            {
              id: 'default',
              title: 'Default',
              fields: [
                'heading',
                'content',
                'image',
                'link',
                'buttonText',
                'buttonArrow',
              ],
            },
          ],
          properties: {
            heading: {
              title: 'Heading',
              type: 'string',
              description:
                'Used as the slide heading, and to describe the slide and its picture to screen reader users. Always add a heading when the slide has a meaningful image.',
            },
            content: { title: 'Content', type: 'text' },
            image: {
              title: 'Image',
              widget: 'object_browser',
              mode: 'image',
              allowExternals: false,
            },
            link: {
              title: 'Link',
              widget: 'object_browser',
              mode: 'link',
              allowExternals: true,
              multi: false,
              default: null,
            },
            buttonText: {
              title: 'Button text',
              type: 'string',
              description: 'The button only shows when the slide has a link.',
            },
            buttonArrow: {
              title: 'Show arrow on button',
              description: "Adds a right arrow to this slide's button",
              type: 'boolean',
              default: false,
            },
          },
          required: [],
        },
      },

      // ── Card layout ────────────────────────────────────────────────────
      slideButtonStyle: {
        title: 'Slide button style',
        widget: 'select',
        choices: getButtonChoices(colors),
        default: getDefaultButton(backgroundColor, colors),
      },
      slideButtonLinkStyle: {
        title: 'Show as a text link',
        description:
          "Removes the button's background and padding, showing the chosen colour as a plain text link aligned with the slide content instead. Applies to slides you add yourself.",
        type: 'boolean',
        default: false,
      },
      dateDisplay: {
        title: 'Show date',
        type: 'string',
        choices: [
          ['none', "Don't show a date"],
          ['effective', 'Publication date'],
          ['start', 'Event start date (falls back to publication date)'],
        ],
        default: 'none',
      },
      hideDescription: {
        title: 'Hide description',
        type: 'boolean',
        default: false,
      },
      hideButtons: {
        title: 'Hide "Read more" buttons',
        type: 'boolean',
        default: false,
      },
      hideCardImage: {
        title: 'Hide image',
        description:
          "Hides each card's image in the 'Image above content' layout, even when a slide has one set",
        type: 'boolean',
        default: false,
      },
      clickableSlides: {
        title: 'Make entire card clickable',
        description:
          'Clicking anywhere on the card follows the slide link. The slide heading is used as the link text for screen readers — add a heading to every slide when this is on.',
        type: 'boolean',
        default: false,
      },
      imageAspectRatio: {
        title: 'Picture shape',
        description:
          'Gives every picture the same shape, trimming the edges to fit, so the slides line up. Try a few to see which suits your pictures.',
        widget: 'select',
        choices: PICTURE_SHAPES,
        default: 'original',
      },
      equalHeight: {
        title: 'Equal height cards',
        description: 'Stretches all cards to match the tallest one in the row',
        type: 'boolean',
        default: false,
      },

      // ── Behaviour ──────────────────────────────────────────────────────
      slidesToShow: {
        title: 'Cards visible at once',
        description: 'On large screens',
        type: 'number',
        default: 1,
      },
      minSlidesOnMobile: {
        title: 'Cards visible on mobile',
        description: 'On phones',
        type: 'number',
        default: 1,
      },
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
        title: 'Time on each slide',
        widget: 'select',
        choices: withSavedChoice(
          SLIDE_TIMES,
          formData?.autoplayDelay,
          msToSeconds,
        ),
        default: 8000,
      },

      // ── Navigation ─────────────────────────────────────────────────────
      arrowPosition: {
        title: 'Arrow position',
        description:
          'On phones the arrows always sit below the carousel, whatever you choose here, so they are easy to reach with a thumb.',
        type: 'string',
        // 'bottom' is what saved carousels store for arrows on the sides;
        // kept so they don't change.
        choices: [
          ['bottom', 'On each side of the carousel'],
          ['below', 'Below the carousel'],
          ['top', 'Top right, beside the heading'],
        ],
        default: 'bottom',
      },
      moreButtonPosition: {
        title: '"More" button position',
        description:
          'Where the optional "More" button appears. Independent of the arrow position.',
        type: 'string',
        choices: [
          ['top', 'Top, beside the heading'],
          ['bottom', 'Below the carousel'],
        ],
        default: 'top',
      },
      moreButtonAlign: {
        title: '"More" button alignment',
        description:
          'Horizontal alignment when the button sits below the carousel dots',
        type: 'string',
        choices: alignmentChoices,
        default: 'center',
      },
      headerLinkText: {
        title: '"More" button text',
        description:
          'Optional button, e.g. "All news". Placed using "More" button position above.',
        type: 'string',
      },
      headerLinkUrl: {
        title: '"More" button link',
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        multi: false,
        default: null,
      },
      headerLinkStyle: {
        title: '"More" button style',
        widget: 'select',
        choices: getButtonChoices(colors),
        default: getDefaultButton(backgroundColor, colors),
      },
      arrowStyle: {
        title: 'Arrow style',
        description:
          'Standard: dark round arrows on the sides, outlined arrows above or below. Or pick a colour to match your buttons.',
        widget: 'select',
        choices: [['default', 'Standard'], ...getButtonChoices(colors)],
        default: 'default',
      },
      listingButtonStyle: {
        title: 'Button style for found pages',
        description: "Style for the 'Read more' button on each found page",
        widget: 'select',
        choices: getButtonChoices(colors),
        default: getDefaultButton(backgroundColor, colors),
      },
      listingButtonLinkStyle: {
        title: 'Show as a text link',
        description:
          "Removes the button's background and padding, showing the chosen colour as a plain text link aligned with the slide content instead. Applies to every found page.",
        type: 'boolean',
        default: false,
      },
      hideArrows: {
        title: 'Hide arrows',
        type: 'boolean',
      },
      hideDots: {
        title: 'Hide dots',
        type: 'boolean',
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

      // ── Background ─────────────────────────────────────────────────────
      backgroundImage: {
        title: 'Background image',
        description:
          'Optional image behind the whole block. Displayed at full cover, no overlay. Decorative: screen readers skip it.',
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
      },
      backgroundColor: {
        title: 'Background colour',
        description:
          'Solid fill for the block. Text colour follows it automatically. If a background image is also set, the image is shown on top of this colour.',
        widget: 'select',
        choices: [['transparent', 'None'], ...getColorChoices(colors)],
        default: 'transparent',
      },
      // Only asked when there's a background image: an image can't be
      // judged automatically; everywhere else the tone follows the colour.
      textTone: {
        title: 'Text over the background image',
        widget: 'select',
        choices: [
          ['light', 'Light (for dark images)'],
          ['dark', 'Dark (for light images)'],
        ],
        default: 'light',
      },
      slideBackgroundColor: {
        title: 'Slide background colour',
        description: 'Fills the background of each slide',
        widget: 'select',
        choices: [['transparent', 'None'], ...getColorChoices(colors)],
        default: 'transparent',
      },
      outerClassName: {
        title: 'Extra style name (for your web team)',
        type: 'string',
      },

      // ── Logo strip ─────────────────────────────────────────────────────
      marqueeSpeed: {
        title: 'Scroll speed',
        widget: 'select',
        choices: withSavedChoice(
          MARQUEE_SPEEDS,
          formData?.marqueeSpeed,
          seconds,
        ),
        default: 20,
      },
      logoHeight: {
        title: 'Logo size',
        widget: 'select',
        choices: withSavedChoice(LOGO_SIZES, formData?.logoHeight, px),
        default: 48,
      },
      logoGap: {
        title: 'Space between logos',
        widget: 'select',
        choices: withSavedChoice(LOGO_GAPS, formData?.logoGap, px),
        default: 32,
      },
      logoPadding: {
        title: 'Space around each logo',
        widget: 'select',
        choices: withSavedChoice(LOGO_PADDINGS, formData?.logoPadding, px),
        default: 8,
      },
      logoAlignment: {
        title: 'Logo alignment',
        description:
          'Where the logos sit when they all fit across. Once there are more than fit, they scroll.',
        type: 'string',
        choices: alignmentChoices,
        default: 'center',
      },
      pauseOnHover: {
        title: 'Pause when hovered',
        type: 'boolean',
        default: true,
      },
    },

    required: [],
  };
};

export default emblaCarouselSchema;
