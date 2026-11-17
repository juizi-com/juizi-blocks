/**
 * The ways the Data visualisation block can show a table, in the order of
 * the sidebar's picker. The ids are the older GraphBlock's `chartType`
 * values, so saved blocks keep their view.
 *
 * kind:
 *   'chart'  drawn with ECharts (server SVG, then interactive)
 *   'table'  plain HTML table
 *   'cards'  plain HTML cards
 * minColumns: how many columns the data needs for the view to make sense.
 */
import messages from './messages';

export const VIEWS = [
  {
    id: 'bar',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewBar,
    description: messages.viewBarHelp,
  },
  {
    id: 'barHorizontal',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewBarHorizontal,
    description: messages.viewBarHorizontalHelp,
  },
  {
    id: 'line',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewLine,
    description: messages.viewLineHelp,
  },
  {
    id: 'area',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewArea,
    description: messages.viewAreaHelp,
  },
  {
    id: 'pie',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewPie,
    description: messages.viewPieHelp,
  },
  {
    id: 'doughnut',
    group: 'charts',
    kind: 'chart',
    minColumns: 2,
    label: messages.viewDoughnut,
    description: messages.viewDoughnutHelp,
  },
  {
    id: 'mixed',
    group: 'charts',
    kind: 'chart',
    minColumns: 3,
    label: messages.viewMixed,
    description: messages.viewMixedHelp,
  },
  {
    id: 'pyramid',
    group: 'charts',
    kind: 'chart',
    minColumns: 3,
    label: messages.viewPyramid,
    description: messages.viewPyramidHelp,
  },
  {
    id: 'table',
    group: 'tables',
    kind: 'table',
    minColumns: 1,
    label: messages.viewTable,
    description: messages.viewTableHelp,
  },
  {
    id: 'searchableTable',
    group: 'tables',
    kind: 'table',
    minColumns: 1,
    label: messages.viewSearchableTable,
    description: messages.viewSearchableTableHelp,
  },
  {
    id: 'stats',
    group: 'cards',
    kind: 'cards',
    minColumns: 2,
    label: messages.viewStats,
    description: messages.viewStatsHelp,
  },
  {
    id: 'rankedBars',
    group: 'cards',
    kind: 'cards',
    minColumns: 2,
    label: messages.viewRankedBars,
    description: messages.viewRankedBarsHelp,
  },
  {
    id: 'rankedCards',
    group: 'cards',
    kind: 'cards',
    minColumns: 3,
    label: messages.viewRankedCards,
    description: messages.viewRankedCardsHelp,
  },
];

export const GROUPS = [
  { id: 'charts', label: messages.groupCharts },
  { id: 'tables', label: messages.groupTables },
  { id: 'cards', label: messages.groupCards },
];

export const getView = (id) => VIEWS.find((view) => view.id === id);

/** Views by kind, for showing sidebar fields only where they apply. */
const ids = (test) => VIEWS.filter(test).map((view) => view.id);
export const CHART_VIEWS = ids((v) => v.kind === 'chart');
export const AXIS_VIEWS = ['bar', 'barHorizontal', 'line', 'area', 'mixed'];
export const BAR_VIEWS = ['bar', 'barHorizontal', 'mixed'];
export const PIE_VIEWS = ['pie', 'doughnut'];
export const HORIZONTAL_VIEWS = ['barHorizontal', 'pyramid'];
export const CARD_VIEWS = ids((v) => v.kind === 'cards');
export const TABLE_VIEWS = ids((v) => v.kind === 'table');
/** Long data is thinned for these (backend juizi.blocks.graph.table). */
export const SERIES_VIEWS = ['bar', 'barHorizontal', 'line', 'area', 'mixed'];
export const viewKind = (id) => (SERIES_VIEWS.includes(id) ? 'series' : 'rows');
