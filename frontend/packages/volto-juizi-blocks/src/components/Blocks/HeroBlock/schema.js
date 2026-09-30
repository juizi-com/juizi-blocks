import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import { alignmentChoices, paddingChoices } from '../_shared/choices';
import { overlayChoices } from '../_shared/overlays';

// Colours this block offers — set per block in the Juizi Blocks dashboard.
// Read at schema time: the list follows dashboard changes.
const getHeroColors = () => getBlockColorList('juiziHero');

// ─── Button sub-schema ─────────────────────────────────────────────────────
// Each button's name in the sidebar list comes from its label (see
// normalizeData in index.js), so there's no separate title field.
const buttonSchema = (bgColor, colors) => ({
  title: 'Button',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['label', 'link', 'buttonStyle', 'showArrow'],
    },
  ],
  properties: {
    label: {
      title: 'Label',
      type: 'string',
      description:
        "Leave empty to use the linked page's title. A button without a link isn't shown to visitors.",
    },
    link: {
      title: 'Link',
      widget: 'object_browser',
      mode: 'link',
      allowExternals: true,
      multi: false,
      default: null,
    },
    buttonStyle: {
      title: 'Button style',
      description:
        'Choose a style that contrasts with your background colour. On a dark background, use a light solid or outline — and vice versa.',
      widget: 'select',
      choices: getButtonChoices(colors),
      default: getDefaultButton(bgColor, colors),
    },
    showArrow: {
      title: 'Show arrow icon',
      description:
        'Adds a small arrow after the label — useful for calls to action like "Learn more". Set per button, so some can have it and others not.',
      type: 'boolean',
      default: false,
    },
  },
  required: [],
});

// ─── Main schema ───────────────────────────────────────────────────────────
// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const schema = (args) => {
  const data = schemaData(args);
  const blockMode = data.blockMode || null;
  const isHeroMode = blockMode === 'hero';
  const isSectionMode = blockMode === 'section';
  const modeSelected = isHeroMode || isSectionMode;
  const buttonsDisplayMode = data.buttonsDisplayMode || 'buttons';
  const usePageTitle = data.usePageTitle !== false;
  const usePageDescription = data.usePageDescription !== false;
  const usePreviewImage = data.usePreviewImage || false;
  const hasBgMedia = !!(data.backgroundImage?.[0] || data.backgroundVideo?.[0]);
  const hasImageLayer = hasBgMedia || usePreviewImage;
  const backgroundColor = data.backgroundColor || null;
  const hasSideImage = !!data.sideImage?.[0];
  const colors = getHeroColors();
  // Section mode background list — includes a "None" option
  const sectionBgList = [['transparent', 'None', 'light'], ...colors];

  // ── Fieldsets — only the display style until one is chosen; after that,
  // in the order the editor works through the block, each switch directly
  // above the field it controls.
  const fieldsets = [
    {
      id: 'default',
      title: 'Options',
      fields: ['blockMode'],
    },

    ...(modeSelected
      ? [
          {
            id: 'content',
            title: 'Content',
            fields: [
              'usePageTitle',
              ...(!usePageTitle ? ['title'] : []),
              'usePageDescription',
              ...(!usePageDescription ? ['subtitle'] : []),
              'preheader',
              'showPublicationDate',
              'showEventDetails',
              ...(isHeroMode ? ['heroLogo', 'logoPosition', 'logoSize'] : []),
              'showBreadcrumbs',
            ],
          },
          {
            id: 'background',
            title: 'Background',
            fields: isHeroMode
              ? [
                  'usePreviewImage',
                  ...(!usePreviewImage
                    ? ['backgroundImage', 'backgroundVideo']
                    : []),
                  ...(hasImageLayer
                    ? ['backgroundPosition', 'overlayStyle']
                    : []),
                ]
              : [
                  'backgroundColor',
                  'backgroundImage',
                  ...(hasBgMedia ? ['backgroundPosition', 'overlayStyle'] : []),
                ],
          },
          // Side image — both modes. A separate, larger image shown beside
          // the text content; its own fieldset so it reads as a distinct
          // feature from the Logo, not a variant of it.
          {
            id: 'sideImage',
            title: 'Side image',
            fields: [
              'sideImage',
              ...(hasSideImage
                ? ['sideImageAlt', 'sideImageAlignment', 'sideImageMobile']
                : []),
            ],
          },
          {
            id: 'buttons',
            title: 'Buttons',
            fields: [
              'buttonsDisplayMode',
              ...(buttonsDisplayMode === 'toc'
                ? ['useH2', 'useH3', 'tocButtonStyle']
                : ['buttons']),
              'smallButtons',
            ],
          },
          {
            id: 'layout',
            title: 'Layout',
            fields: [
              'alignment',
              'horizontalLayout',
              'paddingTop',
              'paddingBottom',
              'isFullWidth',
            ],
          },
          {
            id: 'advanced',
            title: 'Advanced',
            fields: ['isPrimaryHeading', 'hideTitle', 'customClass'],
          },
        ]
      : []),
  ];

  return {
    title: 'Hero',
    fieldsets,
    properties: {
      // Options
      blockMode: {
        title: 'Display style',
        description: modeSelected
          ? 'Hero: a full-width page header. Section: a themed content band inside the page.'
          : 'Choose a display style to continue.',
        choices: [
          ['hero', 'Hero (page header)'],
          ['section', 'Section (content band)'],
        ],
      },
      isFullWidth: {
        title: 'Full width',
        description:
          'Stretch the background edge-to-edge beyond the container.',
        type: 'boolean',
        default: false,
      },
      customClass: {
        title: 'Extra style name (for your web team)',
        type: 'string',
      },
      isPrimaryHeading: {
        title: 'This is the primary page heading',
        type: 'boolean',
        default: false,
        description:
          'Makes this the main heading of the page. Use it for the first and most important block. Only one block per page should have this.',
      },
      hideTitle: {
        title: 'Hide title visually',
        type: 'boolean',
        default: false,
        description:
          'Hides the title on screen while keeping it in the page structure for screen readers and search engines. Useful when the design does not need a visible heading but accessibility and SEO still require one.',
      },

      // Content
      preheader: {
        title: 'Text above the title',
        type: 'string',
        description:
          'Small text displayed above the title. If set, this replaces the publication date or event details.',
      },
      title: {
        title: 'Title',
        type: 'string',
        description:
          'The heading for this block. Even if you hide it visually, it helps screen readers and search engines understand what this section is about.',
      },
      subtitle: {
        title: isHeroMode ? 'Subtitle' : 'Description',
        type: 'string',
        description: isHeroMode
          ? 'Supporting text below the title.'
          : 'Description text below the title.',
      },
      showBreadcrumbs: {
        title: 'Show breadcrumbs',
        type: 'boolean',
        default: false,
        description:
          'Shows where this page sits in the site (for example Home / About) above the title. Hidden on top-level pages.',
      },
      heroLogo: {
        title: 'Logo',
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description:
          'Optional logo displayed in the hero. Treated as decorative: screen readers skip it, so put anything important in the title.',
      },
      logoPosition: {
        title: 'Logo position',
        description: hasSideImage
          ? 'Locked to "Above title" — the side slot is already in use by the Side image below.'
          : 'Choose where the logo sits. "Beside content" is unavailable once a Side image is added.',
        choices: hasSideImage
          ? [['above-title', 'Above title']]
          : [
              ['above-title', 'Above title'],
              ['beside-content', 'Beside content (right)'],
            ],
        default: 'above-title',
      },
      logoSize: {
        title: 'Logo size',
        choices: [
          ['small', 'Small'],
          ['medium', 'Medium'],
          ['large', 'Large'],
        ],
        default: 'medium',
      },

      // Side image (both modes) — a larger, editor-uploaded content image
      // displayed beside the text. Distinct from the Logo above.
      sideImage: {
        title: 'Side image',
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description:
          'A larger image displayed beside your text — not the Logo above. Works in both Hero and Section styles. Adding one moves the Logo (if any) to "Above title", since only one element can occupy the side slot.',
      },
      sideImageAlt: {
        title: 'Alt text',
        type: 'string',
        description:
          'Describes the image for screen reader users. Leave empty only if the image is purely decorative and adds no information beyond the text.',
      },
      sideImageAlignment: {
        title: 'Vertical alignment',
        description:
          'Aligns the image against the height of the text content beside it.',
        choices: [
          ['top', 'Top'],
          ['middle', 'Middle'],
          ['bottom', 'Bottom'],
        ],
        default: 'middle',
      },
      sideImageMobile: {
        title: 'On mobile',
        description:
          'Where the image appears on small screens, where it can no longer sit beside the text.',
        choices: [
          ['below', 'Below content (default)'],
          ['above', 'Above content'],
          ['hidden', 'Hidden'],
        ],
        default: 'below',
      },

      // Page title / description / dates
      usePageTitle: {
        title: 'Use page title',
        type: 'boolean',
        default: true,
        description: 'Pulls the title from the page automatically.',
      },
      usePageDescription: {
        title: 'Use page description',
        type: 'boolean',
        default: true,
        description: 'Pulls the description from the page automatically.',
      },
      usePreviewImage: {
        title: 'Use page preview image',
        type: 'boolean',
        default: false,
        description: 'Uses the page preview image as the hero background.',
      },
      showPublicationDate: {
        title: 'Show publication date',
        type: 'boolean',
        default: false,
        description:
          "For news items — shows the publication date above the title. Only applies when the 'Text above the title' field is empty. If Show event details below is also on, event details take priority.",
      },
      showEventDetails: {
        title: 'Show event details',
        type: 'boolean',
        default: false,
        description:
          'For events — shows the event date(s) and location above the title, e.g. "13 - 14 Nov 2024 | Cape Town". Only applies when the \'Text above the title\' field is empty and the item has a start date. Takes priority over Show publication date.',
      },

      // Background
      backgroundImage: {
        title: 'Background image',
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description:
          'Treated as a decorative image — no alt text is needed or used. Place meaningful content in the title and description fields above.',
      },
      backgroundVideo: {
        title: 'Background video',
        widget: 'object_browser',
        mode: 'file',
        allowExternals: false,
        selectableTypes: ['File'],
        description:
          'MP4 only. Autoplays, loops, stays muted. The video is automatically paused for visitors who have enabled reduced motion in their operating system settings.',
      },
      backgroundPosition: {
        title: 'Background position',
        choices: [
          ['top', 'Top'],
          ['center', 'Centre'],
          ['bottom', 'Bottom'],
        ],
        default: 'center',
      },
      overlayStyle: {
        title: 'Image overlay',
        description:
          'Colour tint over the background image to keep text readable.',
        choices: overlayChoices,
        default: 'gradient',
      },
      backgroundColor: {
        title: 'Background colour',
        description: hasBgMedia
          ? 'The background image still shows on top of this colour, but the text colour follows the colour you pick here. If the text is hard to read on your image, try a different colour: a dark colour gives light text, a light colour gives dark text.'
          : 'Sets the block background. Text colour updates automatically based on your choice.',
        widget: 'select',
        choices: getColorChoices(sectionBgList),
        default: 'transparent',
      },

      // Buttons
      buttonsDisplayMode: {
        title: 'Buttons display',
        choices: [
          ['buttons', 'Buttons'],
          ['list', 'Inline link list'],
          ['toc', 'Buttons to each heading on this page'],
        ],
        default: 'buttons',
      },
      useH2: {
        title: 'Include main headings',
        type: 'boolean',
        default: true,
      },
      useH3: {
        title: 'Include sub-headings',
        type: 'boolean',
        default: true,
      },
      tocButtonStyle: {
        title: 'Button style',
        description:
          'Style applied to all the heading buttons. Choose a style that contrasts with your background.',
        widget: 'select',
        choices: getButtonChoices(colors),
        default: getDefaultButton(backgroundColor, colors),
      },
      buttons: {
        title: 'Buttons',
        widget: 'object_list',
        schema: buttonSchema(backgroundColor, colors),
        default: [],
      },
      smallButtons: {
        title: 'Use smaller buttons',
        type: 'boolean',
        default: false,
      },

      // Layout
      alignment: {
        title: 'Text alignment',
        choices: alignmentChoices,
        default: 'left',
      },
      horizontalLayout: {
        title: 'Side-by-side layout',
        description: 'Display subtitle and buttons beside the title.',
        type: 'boolean',
        default: false,
      },
      paddingTop: {
        title: 'Top padding',
        choices: paddingChoices,
        default: 'default',
      },
      paddingBottom: {
        title: 'Bottom padding',
        choices: paddingChoices,
        default: 'default',
      },
    },
    required: [],
  };
};

export default schema;
