/**
 * Sidebar, in the order the editor works:
 *   Your data → How to show it → Look → Title and caption → Advanced.
 * Each panel appears once the step before it is done, and only fields that
 * do something in the chosen view are shown. No schema defaults: Volto
 * writes them into new blocks (see makeBlockEdit).
 *
 * Field ids are the older GraphBlock's, so saved blocks keep their
 * settings. New ids: dataSource, pastedTable, cardColor.
 */
import { getBlockColorList, getColorChoices } from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import blockMessages from '../../../blocks/messages';
import {
  getAlignmentChoices,
  getOptionalPaddingProperties,
  msToSeconds,
  withSavedChoice,
} from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import { getDataSource, getFileReference } from './data';
import { BLOCK_ID } from './palette';
import {
  AXIS_VIEWS,
  BAR_VIEWS,
  CARD_VIEWS,
  CHART_VIEWS,
  HORIZONTAL_VIEWS,
  TABLE_VIEWS,
} from './views';
import messages from './messages';

/** Has the editor given the block data yet? */
export const hasData = (data = {}) => {
  const source = getDataSource(data);
  if (source === 'file') return !!getFileReference(data.csvFile);
  if (source === 'paste') return !!data.pastedTable?.columns?.length;
  return false;
};

/** The first choices are made: data, and how to show it. */
export const isConfigured = (data = {}) => hasData(data) && !!data.chartType;

const withPlaceholder = (properties, placeholder) =>
  Object.fromEntries(
    Object.entries(properties).map(([id, field]) => [
      id,
      { ...field, placeholder },
    ]),
  );

export const graphSchema = (args) => {
  const t = translator(args.intl);
  const data = schemaData(args);
  const source = getDataSource(data);
  const view = data.chartType;
  const is = (...lists) => lists.flat().includes(view);
  const ready = hasData(data);
  const configured = ready && !!view;
  const colors = getColorChoices(getBlockColorList(BLOCK_ID));

  const dataFields = ['dataSource'];
  if (source === 'file') dataFields.push('csvFile');
  if (source === 'paste') dataFields.push('pastedTable');

  const look = [
    is(CHART_VIEWS, TABLE_VIEWS) && 'useNarrow',
    is('stats') && 'statColumns',
    is('rankedCards') && 'rankedCardColumns',
    is(CARD_VIEWS) && 'cardColor',
    is(CARD_VIEWS) && 'cardAlignment',
    is('rankedCards') && 'showBarInCards',
    (is('rankedBars') || (is('rankedCards') && data.showBarInCards)) &&
      'showBarTrack',
    is(CARD_VIEWS) && 'mobileCarousel',
    is(CHART_VIEWS) && 'showDataLabels',
    is(BAR_VIEWS) && data.showDataLabels && 'dataLabelPosition',
    is(AXIS_VIEWS, 'pyramid') && 'xLabel',
    is(AXIS_VIEWS, 'pyramid') && 'yLabel',
    is('searchableTable') && 'searchPlaceholder',
    'paddingTop',
    'paddingBottom',
  ].filter(Boolean);

  const advanced = [
    source === 'file' && 'delimiter',
    is(AXIS_VIEWS, 'pyramid') && 'reverseX',
    is(AXIS_VIEWS, 'pyramid') && 'reverseY',
    is(HORIZONTAL_VIEWS) && 'xPercent',
    is(AXIS_VIEWS, 'pie', 'doughnut') && !is(HORIZONTAL_VIEWS) && 'yPercent',
    is('stats') && 'statAnimationMs',
    configured && 'titleLevel',
  ].filter(Boolean);

  const speeds = [
    ['0', t(messages.speedOff)],
    ['800', t(messages.speedQuick)],
    ['1500', t(messages.speedNormal)],
    ['2500', t(messages.speedSlow)],
  ];

  return {
    title: t(blockMessages.graph),
    fieldsets: [
      { id: 'default', title: t(messages.panelData), fields: dataFields },
      ...(ready
        ? [{ id: 'view', title: t(messages.panelView), fields: ['chartType'] }]
        : []),
      ...(configured && look.length
        ? [{ id: 'look', title: t(messages.panelLook), fields: look }]
        : []),
      ...(configured
        ? [
            {
              id: 'caption',
              title: t(messages.panelCaption),
              fields: ['title', 'description', 'independent'],
            },
          ]
        : []),
      ...(ready && advanced.length
        ? [{ id: 'advanced', title: t(shared.advanced), fields: advanced }]
        : []),
    ],
    properties: {
      // Empty means None: the block adds no space of its own.
      ...withPlaceholder(getOptionalPaddingProperties(t), t(shared.none)),
      dataSource: {
        title: t(messages.dataSource),
        choices: [
          ['file', t(messages.sourceFile)],
          ['paste', t(messages.sourcePaste)],
        ],
        noValueOption: false,
      },
      csvFile: {
        title: t(messages.csvFile),
        description: t(messages.csvFileHelp),
        widget: 'object_browser',
        mode: 'link',
        selectableTypes: ['File'],
        allowExternals: false,
      },
      pastedTable: {
        title: t(messages.pastedTable),
        description: t(messages.pastedTableHelp),
        widget: 'juiziPasteTable',
      },
      chartType: {
        title: t(messages.chartType),
        widget: 'juiziChartType',
      },
      useNarrow: {
        title: t(messages.useNarrow),
        description: t(messages.useNarrowHelp),
        type: 'boolean',
      },
      statColumns: {
        title: t(messages.cardsPerRow),
        choices: [2, 3, 4, 5].map((n) => [String(n), String(n)]),
      },
      rankedCardColumns: {
        title: t(messages.cardsPerRow),
        choices: [2, 3, 4].map((n) => [String(n), String(n)]),
      },
      cardColor: {
        title: t(messages.cardColor),
        description: t(messages.cardColorHelp),
        choices: [['transparent', t(shared.none)], ...colors],
        placeholder: t(shared.none),
      },
      cardAlignment: {
        title: t(messages.cardAlignment),
        choices: getAlignmentChoices(t),
      },
      showBarInCards: {
        title: t(messages.showBarInCards),
        type: 'boolean',
      },
      showBarTrack: {
        title: t(messages.showBarTrack),
        description: t(messages.showBarTrackHelp),
        type: 'boolean',
      },
      mobileCarousel: {
        title: t(messages.mobileCarousel),
        description: t(messages.mobileCarouselHelp),
        type: 'boolean',
      },
      showDataLabels: {
        title: t(messages.showDataLabels),
        description: t(messages.showDataLabelsHelp),
        type: 'boolean',
      },
      dataLabelPosition: {
        title: t(messages.dataLabelPosition),
        choices: [
          ['end', t(messages.labelEnd)],
          ['center', t(messages.labelCentre)],
          ['start', t(messages.labelStart)],
        ],
      },
      xLabel: {
        title: t(is(HORIZONTAL_VIEWS) ? messages.valueAxis : messages.xLabel),
        description: t(messages.axisLabelHelp),
      },
      yLabel: {
        title: t(
          is(HORIZONTAL_VIEWS) ? messages.categoryAxis : messages.yLabel,
        ),
        description: t(messages.axisLabelHelp),
      },
      searchPlaceholder: {
        title: t(messages.searchPlaceholderField),
        description: t(messages.searchPlaceholderHelp),
      },
      title: {
        title: t(shared.title),
        description: t(messages.titleHelp),
      },
      description: {
        title: t(messages.caption),
        description: t(messages.captionHelp),
        widget: 'textarea',
      },
      independent: {
        title: t(messages.independent),
        description: t(messages.independentHelp),
        type: 'boolean',
      },
      delimiter: {
        title: t(messages.delimiter),
        description: t(messages.delimiterHelp),
        choices: [
          ['auto', t(messages.delimiterAuto)],
          [';', t(messages.delimiterSemicolon)],
          [',', t(messages.delimiterComma)],
          ['\t', t(messages.delimiterTab)],
          ['|', t(messages.delimiterPipe)],
        ],
        placeholder: t(messages.delimiterAuto),
      },
      reverseX: {
        title: t(messages.reverseX),
        type: 'boolean',
      },
      reverseY: {
        title: t(messages.reverseY),
        type: 'boolean',
      },
      xPercent: {
        title: t(messages.percent),
        description: t(messages.percentHelp),
        type: 'boolean',
      },
      yPercent: {
        title: t(messages.percent),
        description: t(messages.percentHelp),
        type: 'boolean',
      },
      titleLevel: {
        title: t(messages.titleLevel),
        description: t(messages.titleLevelHelp),
        choices: [
          ['h2', t(messages.titleLevel2)],
          ['h3', t(messages.titleLevel3)],
          ['h4', t(messages.titleLevel4)],
        ],
        placeholder: t(messages.titleLevel3),
      },
      statAnimationMs: {
        title: t(messages.countUp),
        description: t(messages.countUpHelp),
        choices: withSavedChoice(
          speeds,
          data.statAnimationMs,
          (v) => msToSeconds(v, t),
          t,
        ),
      },
    },
    required: [],
  };
};
