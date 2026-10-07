import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import { getIconChoices } from '../../../config/iconChoices';
import { schemaData } from '../../BlockEdit/BlockEdit';
import blockMessages from '../../../blocks/messages';
import {
  getAlignmentChoices,
  getPaddingChoices,
  getVerticalChoices,
  msToSeconds,
  withSavedChoice,
} from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import { getOverlayChoices } from '../../../config/gradients';
import messages from './messages';

// Colours this block offers — set per block in the Juizi Blocks dashboard.
// Everything colour-related below is built inside functions so it follows
// dashboard changes instead of freezing the list at import time.
const BLOCK_TYPE = 'contentRow';

// Items are named in the sidebar list after their heading (statistics: their
// label) — see index.js. There's no separate "item label" field.

// ─── Shared card fields ────────────────────────────────────────────────────
const cardFields = [
  'image',
  'preheader',
  'heading',
  'text',
  'backgroundColor',
  'buttonText',
  'buttonStyle',
  'link',
];

const linkField = (t) => ({
  title: t(messages.linkOptional),
  widget: 'object_browser',
  mode: 'link',
  allowExternals: true,
});

const noneChoice = (value, t) => [value, t(shared.none)];

const cardProperties = (colors, t) => ({
  image: {
    title: t(shared.image),
    widget: 'object_browser',
    mode: 'image',
    allowExternals: false,
    description: t(messages.cardImageHelp),
  },
  preheader: { title: t(shared.textAboveHeading), type: 'string' },
  heading: { title: t(shared.heading), type: 'string' },
  text: { title: t(shared.description), widget: 'richtext' },
  backgroundColor: {
    title: t(messages.cardBackground),
    widget: 'select',
    choices: [noneChoice('transparent', t), ...getColorChoices(colors)],
    default: 'transparent',
  },
  buttonText: {
    title: t(shared.buttonText),
    type: 'string',
    // In the site's language: this text is what visitors read.
    default: t(shared.readMore),
    description: t(messages.buttonTextHelp),
  },
  buttonStyle: {
    title: t(shared.buttonStyle),
    widget: 'select',
    choices: getButtonChoices(colors, t),
    default: getDefaultButton(null, colors),
  },
  link: linkField(t),
});

// ─── Item sub-schemas per display style ───────────────────────────────────
const itemSchemas = (colors, t) => ({
  numbered: {
    title: t(messages.item),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: [
          'iconCircleColor',
          'preheader',
          'heading',
          'text',
          'backgroundColor',
          'link',
        ],
      },
    ],
    properties: {
      iconCircleColor: {
        title: t(messages.numberCircle),
        widget: 'select',
        choices: [noneChoice('none', t), ...getColorChoices(colors)],
        default: 'none',
        description: t(messages.numberCircleHelp),
      },
      preheader: { title: t(shared.textAboveHeading), type: 'string' },
      heading: { title: t(shared.heading), type: 'string' },
      text: { title: t(shared.description), widget: 'richtext' },
      backgroundColor: {
        title: t(messages.itemBackground),
        widget: 'select',
        choices: [noneChoice('transparent', t), ...getColorChoices(colors)],
        default: 'transparent',
      },
      link: linkField(t),
    },
    required: [],
  },
  statistics: {
    title: t(messages.statistic),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: ['value', 'suffix', 'label', 'extraInfo', 'link'],
      },
    ],
    properties: {
      value: {
        title: t(messages.number),
        type: 'number',
        description: t(messages.numberHelp),
      },
      suffix: { title: t(messages.suffix), type: 'string' },
      label: { title: t(shared.label), type: 'string' },
      extraInfo: { title: t(messages.smallPrint), type: 'string' },
      link: linkField(t),
    },
    required: ['value'],
  },
  icon: {
    title: t(messages.item),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: [
          'icon',
          'iconCircleColor',
          'preheader',
          'heading',
          'text',
          'backgroundColor',
          'link',
        ],
      },
    ],
    properties: {
      icon: {
        title: t(shared.icon),
        type: 'string',
        choices: getIconChoices(t),
        default: 'Globe',
      },
      iconCircleColor: {
        title: t(messages.iconCircle),
        widget: 'select',
        choices: [noneChoice('none', t), ...getColorChoices(colors)],
        default: 'none',
        description: t(messages.iconCircleHelp),
      },
      preheader: { title: t(shared.textAboveHeading), type: 'string' },
      heading: { title: t(shared.heading), type: 'string' },
      text: { title: t(shared.description), widget: 'richtext' },
      backgroundColor: {
        title: t(messages.itemBackground),
        widget: 'select',
        choices: [noneChoice('transparent', t), ...getColorChoices(colors)],
        default: 'transparent',
      },
      link: linkField(t),
    },
    required: [],
  },
  card: {
    title: t(messages.card),
    fieldsets: [
      { id: 'default', title: t(shared.default), fields: cardFields },
    ],
    properties: cardProperties(colors, t),
    required: [],
  },
});

// The style panel is named for what it controls.
const STYLE_PANELS = {
  numbered: { title: messages.numberPosition, fields: ['iconPosition'] },
  icon: { title: messages.iconPosition, fields: ['iconPosition'] },
  statistics: {
    title: messages.counting,
    fields: ['statsFormatK', 'statAnimationMs'],
  },
  card: {
    title: messages.cardLook,
    fields: ['imageCardStyle', 'overlayStyle'],
  },
};

const COUNTING_SPEEDS = [
  [1000, messages.speedQuick],
  [2000, messages.speedNormal],
  [3000, messages.speedSlow],
];

// ─── Main schema ───────────────────────────────────────────────────────────
// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const schema = (args) => {
  const t = translator(args?.intl);
  const data = schemaData(args);
  const displayMode = data.displayMode || null;
  const modeSelected = !!displayMode;

  const backgroundColor = data.backgroundColor || 'transparent';
  const colors = getBlockColorList(BLOCK_TYPE);
  const bgColorList = [['transparent', t(shared.none), 'light'], ...colors];
  const variationItemSchemas = itemSchemas(colors, t);
  const showViewAll = data.showViewAll || false;
  const hasBgImage = !!data.backgroundImage?.[0];
  const itemsTitle = t(
    displayMode === 'statistics' ? messages.statistics : messages.items,
  );

  const stylePanel = modeSelected ? STYLE_PANELS[displayMode] : null;
  const stylePanelFields = stylePanel
    ? stylePanel.fields.filter(
        (field) => field !== 'overlayStyle' || data.imageCardStyle !== 'above',
      )
    : [];

  // The panels follow the canvas from top to bottom, with Items second.
  const fieldsets = [
    {
      id: 'default',
      title: t(shared.options),
      fields: ['displayMode'],
    },

    ...(modeSelected
      ? [
          {
            id: 'header',
            title: t(shared.heading),
            fields: [
              'preheaderText',
              'headerText',
              'descriptionText',
              'blockImage',
              ...(data.blockImage ? ['blockImagePosition'] : []),
              'showViewAll',
              ...(showViewAll
                ? [
                    'viewAllText',
                    'viewAllUrl',
                    'viewAllStyle',
                    'viewAllPosition',
                  ]
                : []),
            ],
          },
          // Always visible once a style is chosen: gating on item count
          // would leave editors who remove every item unable to add one.
          {
            id: `items-${displayMode}`,
            title: itemsTitle,
            fields: ['items'],
          },
          ...(stylePanelFields.length
            ? [
                {
                  id: 'styleOptions',
                  title: t(stylePanel.title),
                  fields: stylePanelFields,
                },
              ]
            : []),
          {
            id: 'layout',
            title: t(shared.layout),
            fields: [
              ...(data.sideBySideLayout ? [] : ['columns']),
              'sideBySideLayout',
              ...(data.sideBySideLayout
                ? ['sideBySideRatio', 'sideBySideAlign']
                : []),
              'headerAlignment',
              'itemsAlignment',
            ],
          },
          {
            id: 'background',
            title: t(messages.backgroundSpacing),
            fields: [
              'backgroundColor',
              'backgroundImage',
              ...(hasBgImage
                ? ['backgroundPosition', 'backgroundOverlay']
                : []),
              'paddingTop',
              'paddingBottom',
            ],
          },
          {
            id: 'mobile',
            title: t(shared.onMobile),
            fields: [
              'mobileCarousel',
              ...(data.mobileCarousel ? ['mobileAutoplay', 'mobileDots'] : []),
            ],
          },
          {
            id: 'advanced',
            title: t(shared.advanced),
            fields: ['customClass'],
          },
        ]
      : []),
  ];

  return {
    title: t(blockMessages.contentRow),
    fieldsets,
    properties: {
      displayMode: {
        title: t(shared.displayStyle),
        description: t(
          modeSelected ? messages.styleSwitchHelp : shared.chooseStyleStart,
        ),
        choices: [
          ['numbered', t(messages.modeNumbered)],
          ['icon', t(shared.icon)],
          ['statistics', t(messages.statistics)],
          ['card', t(messages.modeCard)],
        ],
      },

      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(messages.backgroundColorHelp),
        widget: 'select',
        choices: getColorChoices(bgColorList),
        default: 'transparent',
      },
      backgroundImage: {
        title: t(shared.backgroundImage),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description: t(messages.backgroundImageHelp),
      },
      backgroundPosition: {
        title: t(messages.backgroundPosition),
        choices: [
          ['top', t(shared.top)],
          ['center', t(shared.center)],
          ['bottom', t(shared.bottom)],
        ],
        default: 'center',
      },
      backgroundOverlay: {
        title: t(messages.backgroundOverlay),
        description: t(messages.backgroundOverlayHelp),
        choices: getOverlayChoices(t, data.backgroundOverlay),
        default: 'gradient',
      },
      customClass: {
        title: t(shared.customClass),
        type: 'string',
      },
      paddingTop: {
        title: t(shared.topPadding),
        widget: 'select',
        choices: getPaddingChoices(t),
        default: 'default',
      },
      paddingBottom: {
        title: t(shared.bottomPadding),
        widget: 'select',
        choices: getPaddingChoices(t),
        default: 'default',
      },

      preheaderText: {
        title: t(shared.textAboveHeading),
        type: 'string',
        description: t(messages.preheaderHelp),
      },
      headerText: {
        title: t(shared.heading),
        type: 'string',
        description: t(messages.headingHelp),
      },
      descriptionText: {
        title: t(shared.description),
        type: 'string',
        widget: 'textarea',
        description: t(messages.descriptionHelp),
      },
      blockImage: {
        title: t(messages.blockImage),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description: t(messages.blockImageHelp),
      },
      blockImagePosition: {
        title: t(messages.blockImagePosition),
        widget: 'select',
        choices: [
          ['below', t(messages.belowDescription)],
          ['side', t(messages.nextToDescription)],
        ],
        default: 'below',
      },
      headerAlignment: {
        title: t(messages.headingAlignment),
        choices: getAlignmentChoices(t),
        default: 'left',
      },
      itemsAlignment: {
        title: t(messages.itemsAlignment),
        choices: getAlignmentChoices(t),
        default: 'left',
      },
      showViewAll: {
        title: t(messages.showViewAll),
        type: 'boolean',
        default: false,
      },
      viewAllText: {
        title: t(messages.viewAllLabel),
        type: 'string',
        // In the site's language: this text is what visitors read.
        default: t(shared.viewAll),
      },
      viewAllUrl: {
        title: t(messages.viewAllLink),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        description: t(messages.viewAllLinkHelp),
      },
      viewAllStyle: {
        title: t(messages.viewAllStyle),
        widget: 'select',
        choices: getButtonChoices(colors, t),
        default: getDefaultButton(backgroundColor, colors),
      },
      viewAllPosition: {
        title: t(messages.viewAllPosition),
        widget: 'select',
        choices: [
          ['header', t(messages.aboveItems)],
          ['below', t(messages.belowItems)],
        ],
        default: 'header',
        description: t(messages.viewAllPositionHelp),
      },

      iconPosition: {
        title: t(messages.iconNumberPosition),
        widget: 'select',
        choices: [
          ['above', t(messages.positionAbove)],
          ['left', t(messages.positionLeft)],
          ['inline', t(messages.positionInline)],
        ],
        default: 'above',
        description: t(messages.iconNumberPositionHelp),
      },

      // numberHeadingLevel removed: step numbers are decorative sequencing,
      // not headings. The number is an aria-hidden div styled large.
      statsFormatK: {
        title: t(messages.shortenThousands),
        type: 'boolean',
        default: false,
      },
      statAnimationMs: {
        title: t(messages.countingSpeed),
        description: t(messages.countingSpeedHelp),
        widget: 'select',
        choices: withSavedChoice(
          COUNTING_SPEEDS.map(([value, label]) => [value, t(label)]),
          data.statAnimationMs,
          (ms) => msToSeconds(ms, t),
          t,
        ),
        default: 2000,
      },
      imageCardStyle: {
        title: t(messages.imageLayout),
        type: 'string',
        choices: [
          ['overlay', t(messages.imageBackground)],
          ['above', t(messages.imageAbove)],
        ],
        default: 'overlay',
      },
      overlayStyle: {
        title: t(messages.cardOverlay),
        description: t(messages.cardOverlayHelp),
        choices: getOverlayChoices(t, data.overlayStyle),
        default: 'gradient',
      },

      columns: {
        title: t(messages.columns),
        type: 'number',
        minimum: 1,
        maximum: 6,
        default: displayMode === 'icon' ? 4 : 3,
        description: t(messages.columnsHelp),
      },
      sideBySideLayout: {
        title: t(messages.sideBySide),
        type: 'boolean',
        default: false,
        description: t(messages.sideBySideHelp),
      },
      // Keys are ratios, not percentages (flex-grow, see View.jsx); the
      // '60-30' key is kept for saved content.
      sideBySideRatio: {
        title: t(messages.columnWidths),
        widget: 'select',
        choices: [
          ['25-75', t(messages.ratio2575)],
          ['40-60', t(messages.ratio4060)],
          ['50-50', t(messages.ratio5050)],
          ['60-30', t(messages.ratio6030)],
          ['75-25', t(messages.ratio7525)],
        ],
        default: '50-50',
      },
      sideBySideAlign: {
        title: t(messages.columnAlignment),
        widget: 'select',
        choices: getVerticalChoices(t),
        default: 'top',
        description: t(messages.columnAlignmentHelp),
      },

      mobileCarousel: {
        title: t(messages.mobileCarousel),
        type: 'boolean',
        default: false,
        description: t(messages.mobileCarouselHelp),
      },
      mobileAutoplay: {
        title: t(shared.autoplay),
        type: 'boolean',
        default: false,
      },
      mobileDots: {
        title: t(messages.showDots),
        type: 'boolean',
        default: true,
      },

      items: {
        title: itemsTitle,
        widget: 'object_list',
        default: [],
        schema: modeSelected
          ? variationItemSchemas[displayMode]
          : variationItemSchemas.numbered,
      },
    },
    required: [],
  };
};

export default schema;
