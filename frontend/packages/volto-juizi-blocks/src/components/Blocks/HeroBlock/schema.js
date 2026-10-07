import {
  getBlockColorList,
  getColorChoices,
  getButtonChoices,
  getDefaultButton,
} from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import blockMessages from '../../../blocks/messages';
import {
  getAlignmentChoices,
  getPaddingChoices,
  getVerticalChoices,
} from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import { getOverlayChoices } from '../../../config/gradients';
import messages from './messages';

// Colours this block offers — set per block in the Juizi Blocks dashboard.
// Read at schema time: the list follows dashboard changes.
const getHeroColors = () => getBlockColorList('juiziHero');

// ─── Button sub-schema ─────────────────────────────────────────────────────
// Each button's name in the sidebar list comes from its label (see
// normalizeData in index.js), so there's no separate title field.
const buttonSchema = (bgColor, colors, t) => ({
  title: t(shared.button),
  fieldsets: [
    {
      id: 'default',
      title: t(shared.default),
      fields: ['label', 'link', 'buttonStyle', 'showArrow'],
    },
  ],
  properties: {
    label: {
      title: t(shared.label),
      type: 'string',
      description: t(messages.buttonLabelHelp),
    },
    link: {
      title: t(shared.link),
      widget: 'object_browser',
      mode: 'link',
      allowExternals: true,
      multi: false,
      default: null,
    },
    buttonStyle: {
      title: t(shared.buttonStyle),
      description: t(messages.buttonStyleHelp),
      widget: 'select',
      choices: getButtonChoices(colors, t),
      default: getDefaultButton(bgColor, colors),
    },
    showArrow: {
      title: t(messages.showArrow),
      description: t(messages.showArrowHelp),
      type: 'boolean',
      default: false,
    },
  },
  required: [],
});

// ─── Main schema ───────────────────────────────────────────────────────────
// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const schema = (args) => {
  const t = translator(args?.intl);
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
  const sectionBgList = [['transparent', t(shared.none), 'light'], ...colors];

  // ── Fieldsets — only the display style until one is chosen; after that,
  // in the order the editor works through the block, each switch directly
  // above the field it controls.
  const fieldsets = [
    {
      id: 'default',
      title: t(shared.options),
      fields: ['blockMode'],
    },

    ...(modeSelected
      ? [
          {
            id: 'content',
            title: t(shared.content),
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
            title: t(shared.background),
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
            title: t(messages.sideImage),
            fields: [
              'sideImage',
              ...(hasSideImage
                ? [
                    'sideImageAlt',
                    'sideImagePosition',
                    'sideImageAlignment',
                    'sideImageMobile',
                  ]
                : []),
            ],
          },
          {
            id: 'buttons',
            title: t(shared.buttons),
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
            title: t(shared.layout),
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
            title: t(shared.advanced),
            fields: ['isPrimaryHeading', 'hideTitle', 'customClass'],
          },
        ]
      : []),
  ];

  return {
    title: t(blockMessages.hero),
    fieldsets,
    properties: {
      // Options
      blockMode: {
        title: t(shared.displayStyle),
        description: t(
          modeSelected ? messages.modeHelp : messages.chooseStyleContinue,
        ),
        choices: [
          ['hero', t(messages.modeHero)],
          ['section', t(messages.modeSection)],
        ],
      },
      isFullWidth: {
        title: t(shared.fullWidth),
        description: t(messages.fullWidthHelp),
        type: 'boolean',
        default: false,
      },
      customClass: {
        title: t(shared.customClass),
        type: 'string',
      },
      isPrimaryHeading: {
        title: t(messages.primaryHeading),
        type: 'boolean',
        default: false,
        description: t(messages.primaryHeadingHelp),
      },
      hideTitle: {
        title: t(messages.hideTitle),
        type: 'boolean',
        default: false,
        description: t(messages.hideTitleHelp),
      },

      // Content
      preheader: {
        title: t(messages.preheader),
        type: 'string',
        description: t(messages.preheaderHelp),
      },
      title: {
        title: t(shared.title),
        type: 'string',
        description: t(messages.titleHelp),
      },
      subtitle: {
        title: t(isHeroMode ? messages.subtitle : shared.description),
        type: 'string',
        description: t(
          isHeroMode ? messages.subtitleHelp : messages.descriptionHelp,
        ),
      },
      showBreadcrumbs: {
        title: t(messages.showBreadcrumbs),
        type: 'boolean',
        default: false,
        description: t(messages.showBreadcrumbsHelp),
      },
      heroLogo: {
        title: t(messages.logo),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description: t(messages.logoHelp),
      },
      logoPosition: {
        title: t(messages.logoPosition),
        description: t(
          hasSideImage
            ? messages.logoPositionLocked
            : messages.logoPositionHelp,
        ),
        choices: hasSideImage
          ? [['above-title', t(messages.aboveTitle)]]
          : [
              ['above-title', t(messages.aboveTitle)],
              ['beside-content', t(messages.besideContent)],
            ],
        default: 'above-title',
      },
      logoSize: {
        title: t(messages.logoSize),
        choices: [
          ['small', t(shared.small)],
          ['medium', t(shared.medium)],
          ['large', t(shared.large)],
        ],
        default: 'medium',
      },

      // Side image (both modes) — a larger, editor-uploaded content image
      // displayed beside the text. Distinct from the Logo above.
      sideImage: {
        title: t(messages.sideImage),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description: t(messages.sideImageHelp),
      },
      sideImageAlt: {
        title: t(messages.altText),
        type: 'string',
        description: t(messages.altTextHelp),
      },
      sideImagePosition: {
        title: t(messages.sideImagePosition),
        description: t(messages.sideImagePositionHelp),
        choices: [
          ['right', t(shared.right)],
          ['left', t(shared.left)],
        ],
        default: 'right',
      },
      sideImageAlignment: {
        title: t(messages.verticalAlignment),
        description: t(messages.verticalAlignmentHelp),
        choices: getVerticalChoices(t),
        default: 'middle',
      },
      sideImageMobile: {
        title: t(shared.onMobile),
        description: t(messages.sideImageMobileHelp),
        choices: [
          ['below', t(messages.belowContent)],
          ['above', t(messages.aboveContent)],
          ['hidden', t(messages.hidden)],
        ],
        default: 'below',
      },

      // Page title / description / dates
      usePageTitle: {
        title: t(messages.usePageTitle),
        type: 'boolean',
        default: true,
        description: t(messages.usePageTitleHelp),
      },
      usePageDescription: {
        title: t(messages.usePageDescription),
        type: 'boolean',
        default: true,
        description: t(messages.usePageDescriptionHelp),
      },
      usePreviewImage: {
        title: t(messages.usePreviewImage),
        type: 'boolean',
        default: false,
        description: t(messages.usePreviewImageHelp),
      },
      showPublicationDate: {
        title: t(messages.showPublicationDate),
        type: 'boolean',
        default: false,
        description: t(messages.showPublicationDateHelp),
      },
      showEventDetails: {
        title: t(messages.showEventDetails),
        type: 'boolean',
        default: false,
        description: t(messages.showEventDetailsHelp),
      },

      // Background
      backgroundImage: {
        title: t(shared.backgroundImage),
        widget: 'object_browser',
        mode: 'image',
        allowExternals: false,
        description: t(messages.backgroundImageHelp),
      },
      backgroundVideo: {
        title: t(messages.backgroundVideo),
        widget: 'object_browser',
        mode: 'file',
        allowExternals: false,
        selectableTypes: ['File'],
        description: t(messages.backgroundVideoHelp),
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
      overlayStyle: {
        title: t(messages.imageOverlay),
        description: t(messages.imageOverlayHelp),
        choices: getOverlayChoices(t, data.overlayStyle),
        default: 'gradient',
      },
      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(
          hasBgMedia
            ? messages.backgroundColorImageHelp
            : messages.backgroundColorHelp,
        ),
        widget: 'select',
        choices: getColorChoices(sectionBgList),
        default: 'transparent',
      },

      // Buttons
      buttonsDisplayMode: {
        title: t(messages.buttonsDisplay),
        choices: [
          ['buttons', t(shared.buttons)],
          ['list', t(messages.displayList)],
          ['toc', t(messages.displayToc)],
        ],
        default: 'buttons',
      },
      useH2: {
        title: t(messages.useH2),
        type: 'boolean',
        default: true,
      },
      useH3: {
        title: t(messages.useH3),
        type: 'boolean',
        default: true,
      },
      tocButtonStyle: {
        title: t(shared.buttonStyle),
        description: t(messages.tocButtonStyleHelp),
        widget: 'select',
        choices: getButtonChoices(colors, t),
        default: getDefaultButton(backgroundColor, colors),
      },
      buttons: {
        title: t(shared.buttons),
        widget: 'object_list',
        schema: buttonSchema(backgroundColor, colors, t),
        default: [],
      },
      smallButtons: {
        title: t(messages.smallButtons),
        type: 'boolean',
        default: false,
      },

      // Layout
      alignment: {
        title: t(shared.textAlignment),
        choices: getAlignmentChoices(t),
        default: 'left',
      },
      horizontalLayout: {
        title: t(messages.sideBySide),
        description: t(messages.sideBySideHelp),
        type: 'boolean',
        default: false,
      },
      paddingTop: {
        title: t(shared.topPadding),
        choices: getPaddingChoices(t),
        default: 'default',
      },
      paddingBottom: {
        title: t(shared.bottomPadding),
        choices: getPaddingChoices(t),
        default: 'default',
      },
    },
    required: [],
  };
};

export default schema;
