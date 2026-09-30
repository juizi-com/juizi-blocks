import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import { iconChoicesList } from '../../../config/iconChoices';
import { schemaData } from '../../BlockEdit/BlockEdit';
import {
  alignmentChoices,
  msToSeconds,
  paddingChoices,
  withSavedChoice,
} from '../_shared/choices';
import { overlayChoices } from '../_shared/overlays';

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

const linkField = {
  title: 'Link (optional)',
  widget: 'object_browser',
  mode: 'link',
  allowExternals: true,
};

const cardProperties = (colors) => ({
  image: {
    title: 'Image',
    widget: 'object_browser',
    mode: 'image',
    allowExternals: false,
    description:
      'The card heading is used as the image alt text. Add a heading to every card that has a meaningful image.',
  },
  preheader: { title: 'Text above the heading', type: 'string' },
  heading: { title: 'Heading', type: 'string' },
  text: { title: 'Description', widget: 'richtext' },
  backgroundColor: {
    title: 'Card background colour',
    widget: 'select',
    choices: [['transparent', 'None'], ...getColorChoices(colors)],
    default: 'transparent',
  },
  buttonText: {
    title: 'Button text',
    type: 'string',
    default: 'Read more',
    description: 'The button only shows when the card has a link.',
  },
  buttonStyle: {
    title: 'Button style',
    widget: 'select',
    choices: getButtonChoices(colors),
    default: getDefaultButton(null, colors),
  },
  link: linkField,
});

// ─── Item sub-schemas per display style ───────────────────────────────────
const itemSchemas = (colors) => ({
  numbered: {
    title: 'Item',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
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
        title: 'Number circle colour',
        widget: 'select',
        choices: [['none', 'None'], ...getColorChoices(colors)],
        default: 'none',
        description:
          'Places the number inside a coloured circle. Leave as None to keep the plain number.',
      },
      preheader: { title: 'Text above the heading', type: 'string' },
      heading: { title: 'Heading', type: 'string' },
      text: { title: 'Description', widget: 'richtext' },
      backgroundColor: {
        title: 'Item background colour',
        widget: 'select',
        choices: [['transparent', 'None'], ...getColorChoices(colors)],
        default: 'transparent',
      },
      link: linkField,
    },
    required: [],
  },
  statistics: {
    title: 'Statistic',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['value', 'suffix', 'label', 'extraInfo', 'link'],
      },
    ],
    properties: {
      value: {
        title: 'Number',
        type: 'number',
        description: 'Counts up from 0 to this number.',
      },
      suffix: { title: 'After the number (e.g. % or +)', type: 'string' },
      label: { title: 'Label', type: 'string' },
      extraInfo: { title: 'Small print', type: 'string' },
      link: linkField,
    },
    required: ['value'],
  },
  icon: {
    title: 'Item',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
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
        title: 'Icon',
        type: 'string',
        choices: iconChoicesList,
        default: 'Globe',
      },
      iconCircleColor: {
        title: 'Icon circle colour',
        widget: 'select',
        choices: [['none', 'None'], ...getColorChoices(colors)],
        default: 'none',
        description:
          'Places the icon inside a coloured circle. Leave as None to keep the plain icon.',
      },
      preheader: { title: 'Text above the heading', type: 'string' },
      heading: { title: 'Heading', type: 'string' },
      text: { title: 'Description', widget: 'richtext' },
      backgroundColor: {
        title: 'Item background colour',
        widget: 'select',
        choices: [['transparent', 'None'], ...getColorChoices(colors)],
        default: 'transparent',
      },
      link: linkField,
    },
    required: [],
  },
  card: {
    title: 'Card',
    fieldsets: [{ id: 'default', title: 'Default', fields: cardFields }],
    properties: cardProperties(colors),
    required: [],
  },
});

// The style panel is named for what it controls.
const STYLE_PANELS = {
  numbered: { title: 'Number position', fields: ['iconPosition'] },
  icon: { title: 'Icon position', fields: ['iconPosition'] },
  statistics: {
    title: 'Counting',
    fields: ['statsFormatK', 'statAnimationMs'],
  },
  card: { title: 'Card look', fields: ['imageCardStyle', 'overlayStyle'] },
};

const COUNTING_SPEEDS = [
  [1000, 'Quick (1 second)'],
  [2000, 'Normal (2 seconds)'],
  [3000, 'Slow (3 seconds)'],
];

// ─── Main schema ───────────────────────────────────────────────────────────
// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const schema = (args) => {
  const data = schemaData(args);
  const displayMode = data.displayMode || null;
  const modeSelected = !!displayMode;

  const backgroundColor = data.backgroundColor || 'transparent';
  const colors = getBlockColorList(BLOCK_TYPE);
  const bgColorList = [['transparent', 'None', 'light'], ...colors];
  const variationItemSchemas = itemSchemas(colors);
  const showViewAll = data.showViewAll || false;

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
      title: 'Options',
      fields: ['displayMode'],
    },

    ...(modeSelected
      ? [
          {
            id: 'header',
            title: 'Heading',
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
            title: displayMode === 'statistics' ? 'Statistics' : 'Items',
            fields: ['items'],
          },
          ...(stylePanelFields.length
            ? [
                {
                  id: 'styleOptions',
                  title: stylePanel.title,
                  fields: stylePanelFields,
                },
              ]
            : []),
          {
            id: 'layout',
            title: 'Layout',
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
            title: 'Background & spacing',
            fields: ['backgroundColor', 'paddingTop', 'paddingBottom'],
          },
          {
            id: 'mobile',
            title: 'On mobile',
            fields: [
              'mobileCarousel',
              ...(data.mobileCarousel ? ['mobileAutoplay', 'mobileDots'] : []),
            ],
          },
          {
            id: 'advanced',
            title: 'Advanced',
            fields: ['customClass'],
          },
        ]
      : []),
  ];

  return {
    title: 'Content Row',
    fieldsets,
    properties: {
      displayMode: {
        title: 'Display style',
        description: modeSelected
          ? 'Switching style keeps your headings, text and links. Other fields may not carry over.'
          : 'Choose a display style to get started.',
        choices: [
          ['numbered', 'Numbered'],
          ['icon', 'Icon'],
          ['statistics', 'Statistics'],
          ['card', 'Image card'],
        ],
      },

      backgroundColor: {
        title: 'Background colour',
        description:
          'The block background is always full width. Text colour updates automatically.',
        widget: 'select',
        choices: getColorChoices(bgColorList),
        default: 'transparent',
      },
      customClass: {
        title: 'Extra style name (for your web team)',
        type: 'string',
      },
      paddingTop: {
        title: 'Top padding',
        widget: 'select',
        choices: paddingChoices,
        default: 'default',
      },
      paddingBottom: {
        title: 'Bottom padding',
        widget: 'select',
        choices: paddingChoices,
        default: 'default',
      },

      preheaderText: {
        title: 'Text above the heading',
        type: 'string',
        description: 'Small text above the main heading.',
      },
      headerText: {
        title: 'Heading',
        type: 'string',
        description:
          'The main heading for this row. Screen readers use it to name this section, so even a short heading helps.',
      },
      descriptionText: {
        title: 'Description',
        type: 'string',
        widget: 'textarea',
        description: 'Supporting text below the heading.',
      },
      blockImage: {
        title: 'Block image',
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description:
          'Optional image shown alongside the heading and description. The block heading is used to describe this image to screen reader users.',
      },
      blockImagePosition: {
        title: 'Block image position',
        widget: 'select',
        choices: [
          ['below', 'Below description'],
          ['side', 'Next to description'],
        ],
        default: 'below',
      },
      headerAlignment: {
        title: 'Heading alignment',
        choices: alignmentChoices,
        default: 'left',
      },
      itemsAlignment: {
        title: 'Items alignment',
        choices: alignmentChoices,
        default: 'left',
      },
      showViewAll: {
        title: 'Show "View all" button',
        type: 'boolean',
        default: false,
      },
      viewAllText: {
        title: '"View all" label',
        type: 'string',
        default: 'View all',
      },
      viewAllUrl: {
        title: '"View all" link',
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        description: "The button isn't shown to visitors until it has a link.",
      },
      viewAllStyle: {
        title: '"View all" button style',
        widget: 'select',
        choices: getButtonChoices(colors),
        default: getDefaultButton(backgroundColor, colors),
      },
      viewAllPosition: {
        title: '"View all" button position',
        widget: 'select',
        choices: [
          ['header', 'Above items (with heading)'],
          ['below', 'Below items'],
        ],
        default: 'header',
        description: 'Where the "View all" button sits relative to the items.',
      },

      iconPosition: {
        title: 'Icon/number position',
        widget: 'select',
        choices: [
          ['above', 'Above (default)'],
          ['left', 'Left of content'],
          ['inline', 'To the right of the text'],
        ],
        default: 'above',
        description:
          'Where the icon or number sits relative to the heading and description.',
      },

      // numberHeadingLevel removed: step numbers are decorative sequencing,
      // not headings. The number is an aria-hidden div styled large.
      statsFormatK: {
        title: 'Shorten thousands (1 000 → 1k)',
        type: 'boolean',
        default: false,
      },
      statAnimationMs: {
        title: 'Counting speed',
        description: 'How long the numbers take to count up.',
        widget: 'select',
        choices: withSavedChoice(
          COUNTING_SPEEDS,
          data.statAnimationMs,
          msToSeconds,
        ),
        default: 2000,
      },
      imageCardStyle: {
        title: 'Image layout',
        type: 'string',
        choices: [
          ['overlay', 'Image as background with text overlay'],
          ['above', 'Image above content'],
        ],
        default: 'overlay',
      },
      overlayStyle: {
        title: 'Card image overlay',
        description: 'Colour tint applied over all card background images.',
        choices: overlayChoices,
        default: 'gradient',
      },

      columns: {
        title: 'Columns on large screens',
        type: 'number',
        minimum: 1,
        maximum: 6,
        default: displayMode === 'icon' ? 4 : 3,
        description: 'Phones always show one column.',
      },
      sideBySideLayout: {
        title: 'Heading beside the items (large screens)',
        type: 'boolean',
        default: false,
        description:
          'Shows the heading and description next to the items, as two columns. Stacks to one column on phones.',
      },
      // Keys are ratios, not percentages (flex-grow, see View.jsx); the
      // '60-30' key is kept for saved content.
      sideBySideRatio: {
        title: 'Column widths (heading / items)',
        widget: 'select',
        choices: [
          ['25-75', 'Narrow heading (quarter / three quarters)'],
          ['40-60', 'Slightly narrow heading (40% / 60%)'],
          ['50-50', 'Equal (half / half)'],
          ['60-30', 'Wider heading (two thirds / one third)'],
          ['75-25', 'Wide heading (three quarters / quarter)'],
        ],
        default: '50-50',
      },
      sideBySideAlign: {
        title: 'Column alignment',
        widget: 'select',
        choices: [
          ['top', 'Top'],
          ['middle', 'Middle'],
          ['bottom', 'Bottom'],
        ],
        default: 'top',
        description:
          'Vertical alignment of the heading column against the items column when they end up different heights.',
      },

      mobileCarousel: {
        title: 'Carousel on mobile',
        type: 'boolean',
        default: false,
        description: 'Items become a swipeable carousel on small screens.',
      },
      mobileAutoplay: {
        title: 'Autoplay',
        type: 'boolean',
        default: false,
      },
      mobileDots: {
        title: 'Show dots',
        type: 'boolean',
        default: true,
      },

      items: {
        title: displayMode === 'statistics' ? 'Statistics' : 'Items',
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
