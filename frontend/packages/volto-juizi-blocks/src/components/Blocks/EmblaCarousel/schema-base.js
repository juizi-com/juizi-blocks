import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import blockMessages from '../../../blocks/messages';
import {
  getAlignmentChoices,
  msToSeconds,
  secondsLabel,
  withSavedChoice,
} from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

// ─── Condition helpers ─────────────────────────────────────────────────────
const isContentMode = (formData) =>
  formData?.displayMode === 'full' || formData?.displayMode === 'image-top';
const isImageTopMode = (formData) => formData?.displayMode === 'image-top';
// Styles where the picture itself sets the slide's size (the text-overlay
// style uses the picture as a background, so its height follows the text).
const hasPictureShape = (formData) =>
  formData?.displayMode === 'image-only' || isImageTopMode(formData);

// Named choices store the same values the fields used to take as numbers;
// a saved value that isn't one of them shows as "Custom (…)". The labels are
// messages (or, for times, a number of seconds), translated in the schema.
const SLIDE_TIMES = [4000, 6000, 8000, 10000];
const MARQUEE_SPEEDS = [
  [30, messages.slow],
  [20, shared.normal],
  [12, messages.fast],
];
const LOGO_SIZES = [
  [32, shared.small],
  [48, shared.medium],
  [64, shared.large],
];
const LOGO_GAPS = [
  [16, messages.tight],
  [32, shared.normal],
  [48, messages.wide],
];
const LOGO_PADDINGS = [
  [4, shared.small],
  [8, shared.normal],
  [16, shared.large],
];
// Stored as "width:height"; View.jsx turns it into a CSS aspect-ratio.
// Strings, so the select keeps the value exactly as chosen.
const PICTURE_SHAPES = [
  ['original', messages.shapeOriginal],
  ['16:9', messages.shapeWide],
  ['3:2', messages.shapeLandscape],
  ['4:3', messages.shapeStandard],
  ['1:1', messages.shapeSquare],
  ['3:4', messages.shapePortrait],
];
const px = (value) => `${value}px`;

// ─── Schema ────────────────────────────────────────────────────────────────
const emblaCarouselSchema = ({ formData, intl } = {}) => {
  const t = translator(intl);
  const labelled = (choices) =>
    choices.map(([value, label]) => [value, t(label)]);
  const noneChoice = ['transparent', t(shared.none)];
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
    title: t(blockMessages.carousel),

    fieldsets: [
      // Display style first, always visible
      {
        id: 'default',
        title: t(shared.content),
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
              title: t(messages.cardLayout),
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
              title: t(messages.behaviour),
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
              title: t(messages.navigation),
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
              title: t(messages.logoStrip),
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
              title: t(shared.appearance),
              fields: ['alignment', 'isFullWidth'],
            },
            {
              id: 'background',
              title: t(shared.background),
              fields: [
                'backgroundImage',
                'backgroundColor',
                ...(hasBackgroundImage ? ['textTone'] : []),
                'slideBackgroundColor',
              ],
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
          !modeSelected
            ? shared.chooseStyleStart
            : isLogoMarquee
              ? messages.styleLogoHelp
              : messages.styleChangeHelp,
        ),
        type: 'string',
        choices: [
          ['full', t(messages.modeFull)],
          ['image-only', t(messages.modeImageOnly)],
          ['image-top', t(messages.modeImageTop)],
          ['logo-marquee', t(messages.modeLogo)],
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
        description: t(messages.introHelp),
        type: 'string',
      },
      useListing: {
        title: t(messages.useListing),
        description: t(messages.useListingHelp),
        type: 'boolean',
        default: false,
      },
      filterTags: {
        title: t(messages.filterTags),
        description: t(messages.filterTagsHelp),
        type: 'string',
      },
      slides: {
        title: t(messages.slides),
        widget: 'object_list',
        schema: {
          title: t(messages.slide),
          fieldsets: [
            {
              id: 'default',
              title: t(shared.default),
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
              title: t(shared.heading),
              type: 'string',
              description: t(messages.slideHeadingHelp),
            },
            content: { title: t(shared.content), type: 'text' },
            image: {
              title: t(shared.image),
              widget: 'object_browser',
              mode: 'image',
              allowExternals: false,
            },
            link: {
              title: t(shared.link),
              widget: 'object_browser',
              mode: 'link',
              allowExternals: true,
              multi: false,
              default: null,
            },
            buttonText: {
              title: t(shared.buttonText),
              type: 'string',
              description: t(messages.slideButtonHelp),
            },
            buttonArrow: {
              title: t(messages.buttonArrow),
              description: t(messages.buttonArrowHelp),
              type: 'boolean',
              default: false,
            },
          },
          required: [],
        },
      },

      // ── Card layout ────────────────────────────────────────────────────
      slideButtonStyle: {
        title: t(messages.slideButtonStyle),
        widget: 'select',
        choices: getButtonChoices(colors, t),
        default: getDefaultButton(backgroundColor, colors),
      },
      slideButtonLinkStyle: {
        title: t(messages.textLink),
        description: t(messages.textLinkHelpManual),
        type: 'boolean',
        default: false,
      },
      dateDisplay: {
        title: t(messages.showDate),
        type: 'string',
        choices: [
          ['none', t(messages.dateNone)],
          ['effective', t(messages.datePublication)],
          ['start', t(messages.dateStart)],
        ],
        default: 'none',
      },
      hideDescription: {
        title: t(messages.hideDescription),
        type: 'boolean',
        default: false,
      },
      hideButtons: {
        title: t(messages.hideButtons),
        type: 'boolean',
        default: false,
      },
      hideCardImage: {
        title: t(messages.hideImage),
        description: t(messages.hideImageHelp),
        type: 'boolean',
        default: false,
      },
      clickableSlides: {
        title: t(messages.clickable),
        description: t(messages.clickableHelp),
        type: 'boolean',
        default: false,
      },
      imageAspectRatio: {
        title: t(messages.pictureShape),
        description: t(messages.pictureShapeHelp),
        widget: 'select',
        choices: labelled(PICTURE_SHAPES),
        default: 'original',
      },
      equalHeight: {
        title: t(messages.equalHeight),
        description: t(messages.equalHeightHelp),
        type: 'boolean',
        default: false,
      },

      // ── Behaviour ──────────────────────────────────────────────────────
      slidesToShow: {
        title: t(messages.slidesToShow),
        description: t(messages.largeScreens),
        type: 'number',
        default: 1,
      },
      minSlidesOnMobile: {
        title: t(messages.slidesMobile),
        description: t(messages.phones),
        type: 'number',
        default: 1,
      },
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
        title: t(messages.slideTime),
        widget: 'select',
        choices: withSavedChoice(
          SLIDE_TIMES.map((ms) => [ms, msToSeconds(ms, t)]),
          formData?.autoplayDelay,
          (ms) => msToSeconds(ms, t),
          t,
        ),
        default: 8000,
      },

      // ── Navigation ─────────────────────────────────────────────────────
      arrowPosition: {
        title: t(shared.arrowPosition),
        description: t(messages.arrowPositionHelp),
        type: 'string',
        // 'bottom' is what saved carousels store for arrows on the sides;
        // kept so they don't change.
        choices: [
          ['bottom', t(messages.arrowsSides)],
          ['below', t(messages.belowCarousel)],
          ['top', t(messages.arrowsTop)],
        ],
        default: 'bottom',
      },
      moreButtonPosition: {
        title: t(messages.moreButtonPosition),
        description: t(messages.moreButtonPositionHelp),
        type: 'string',
        choices: [
          ['top', t(messages.moreTop)],
          ['bottom', t(messages.belowCarousel)],
        ],
        default: 'top',
      },
      moreButtonAlign: {
        title: t(messages.moreButtonAlign),
        description: t(messages.moreButtonAlignHelp),
        type: 'string',
        choices: getAlignmentChoices(t),
        default: 'center',
      },
      headerLinkText: {
        title: t(messages.moreButtonText),
        description: t(messages.moreButtonTextHelp),
        type: 'string',
      },
      headerLinkUrl: {
        title: t(messages.moreButtonLink),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        multi: false,
        default: null,
      },
      headerLinkStyle: {
        title: t(messages.moreButtonStyle),
        widget: 'select',
        choices: getButtonChoices(colors, t),
        default: getDefaultButton(backgroundColor, colors),
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
      listingButtonStyle: {
        title: t(messages.listingButtonStyle),
        description: t(messages.listingButtonStyleHelp),
        widget: 'select',
        choices: getButtonChoices(colors, t),
        default: getDefaultButton(backgroundColor, colors),
      },
      listingButtonLinkStyle: {
        title: t(messages.textLink),
        description: t(messages.textLinkHelpListing),
        type: 'boolean',
        default: false,
      },
      hideArrows: {
        title: t(shared.hideArrows),
        type: 'boolean',
      },
      hideDots: {
        title: t(messages.hideDots),
        type: 'boolean',
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

      // ── Background ─────────────────────────────────────────────────────
      backgroundImage: {
        title: t(shared.backgroundImage),
        description: t(messages.backgroundImageHelp),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
      },
      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(messages.backgroundColorHelp),
        widget: 'select',
        choices: [noneChoice, ...getColorChoices(colors)],
        default: 'transparent',
      },
      // Only asked when there's a background image: an image can't be
      // judged automatically; everywhere else the tone follows the colour.
      textTone: {
        title: t(messages.textTone),
        widget: 'select',
        choices: [
          ['light', t(messages.toneLight)],
          ['dark', t(messages.toneDark)],
        ],
        default: 'light',
      },
      slideBackgroundColor: {
        title: t(messages.slideBackground),
        description: t(messages.slideBackgroundHelp),
        widget: 'select',
        choices: [noneChoice, ...getColorChoices(colors)],
        default: 'transparent',
      },
      outerClassName: {
        title: t(shared.customClass),
        type: 'string',
      },

      // ── Logo strip ─────────────────────────────────────────────────────
      marqueeSpeed: {
        title: t(messages.scrollSpeed),
        widget: 'select',
        choices: withSavedChoice(
          labelled(MARQUEE_SPEEDS),
          formData?.marqueeSpeed,
          (value) => secondsLabel(value, t),
          t,
        ),
        default: 20,
      },
      logoHeight: {
        title: t(messages.logoSize),
        widget: 'select',
        choices: withSavedChoice(
          labelled(LOGO_SIZES),
          formData?.logoHeight,
          px,
          t,
        ),
        default: 48,
      },
      logoGap: {
        title: t(messages.logoGap),
        widget: 'select',
        choices: withSavedChoice(labelled(LOGO_GAPS), formData?.logoGap, px, t),
        default: 32,
      },
      logoPadding: {
        title: t(messages.logoPadding),
        widget: 'select',
        choices: withSavedChoice(
          labelled(LOGO_PADDINGS),
          formData?.logoPadding,
          px,
          t,
        ),
        default: 8,
      },
      logoAlignment: {
        title: t(messages.logoAlignment),
        description: t(messages.logoAlignmentHelp),
        type: 'string',
        choices: getAlignmentChoices(t),
        default: 'center',
      },
      pauseOnHover: {
        title: t(messages.pauseOnHover),
        type: 'boolean',
        default: true,
      },
    },

    required: [],
  };
};

export default emblaCarouselSchema;
