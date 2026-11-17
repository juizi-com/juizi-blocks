import { defineMessages } from 'react-intl';

// Data visualisation block: sidebar, chart-type picker, the prompts editors
// see on the canvas, and the text visitors read.
export default defineMessages({
  // Sidebar panels
  panelData: { id: 'juizi-graph-panel-data', defaultMessage: 'Your data' },
  panelView: { id: 'juizi-graph-panel-view', defaultMessage: 'How to show it' },
  panelLook: { id: 'juizi-graph-panel-look', defaultMessage: 'Look' },
  panelCaption: {
    id: 'juizi-graph-panel-caption',
    defaultMessage: 'Title and caption',
  },

  // Your data
  dataSource: {
    id: 'juizi-graph-data-source',
    defaultMessage: 'Where is your data?',
  },
  sourceFile: {
    id: 'juizi-graph-source-file',
    defaultMessage: 'A CSV file on this site',
  },
  sourceFileHelp: {
    id: 'juizi-graph-source-file-help',
    defaultMessage:
      'the chart always shows what’s in the file: upload a new version and every page using it updates by itself',
  },
  sourcePaste: {
    id: 'juizi-graph-source-paste',
    defaultMessage: 'Paste from a spreadsheet',
  },
  sourcePasteHelp: {
    id: 'juizi-graph-source-paste-help',
    defaultMessage:
      'copy the cells in Excel or Google Sheets and paste them; the figures are kept with this page',
  },
  csvFile: { id: 'juizi-graph-csv-file', defaultMessage: 'CSV file' },
  csvFileHelp: {
    id: 'juizi-graph-csv-file-help',
    defaultMessage:
      'Choose a CSV file on this site. Save it from your spreadsheet as “CSV”. The first row holds the column names, the first column the labels (years, places, names). Not on the site yet? Save this page, add the file with the Add (+) button in the toolbar, then come back and choose it here.',
  },
  pastedTable: {
    id: 'juizi-graph-pasted-table',
    defaultMessage: 'Your figures',
  },
  pastedTableHelp: {
    id: 'juizi-graph-pasted-table-help',
    defaultMessage:
      'Copy the cells in your spreadsheet, including the row of column names, and paste them here. The first column holds the labels (years, places, names).',
  },
  pasteBox: {
    id: 'juizi-graph-paste-box',
    defaultMessage: 'Paste your cells here',
  },
  pasteUse: {
    id: 'juizi-graph-paste-use',
    defaultMessage: 'Use these figures',
  },
  pasteReplace: {
    id: 'juizi-graph-paste-replace',
    defaultMessage: 'Paste new figures',
  },
  pasteCancel: {
    id: 'juizi-graph-paste-cancel',
    defaultMessage: 'Keep the current figures',
  },
  pasteSummary: {
    id: 'juizi-graph-paste-summary',
    defaultMessage:
      'In use: {columns, plural, one {# column} other {# columns}} ({names}), {rows, plural, one {# row} other {# rows}}.',
  },
  pasteReading: {
    id: 'juizi-graph-paste-reading',
    defaultMessage: 'Reading your figures…',
  },
  pasteFailed: {
    id: 'juizi-graph-paste-failed',
    defaultMessage:
      'These figures couldn’t be read. Copy the cells again from your spreadsheet, including the row of column names.',
  },
  pasteTooBig: {
    id: 'juizi-graph-paste-too-big',
    defaultMessage:
      'That’s too much to keep in the page. Save it as a CSV file instead, add it to the site and choose “A CSV file on this site”.',
  },
  pasteTooLong: {
    id: 'juizi-graph-paste-too-long',
    defaultMessage:
      'Only the first {shown} of {total} rows were kept. For longer data, use a CSV file on this site instead.',
  },

  // How to show it: the picker
  chartType: { id: 'juizi-graph-chart-type', defaultMessage: 'Show as' },
  groupCharts: { id: 'juizi-graph-group-charts', defaultMessage: 'Charts' },
  groupTables: { id: 'juizi-graph-group-tables', defaultMessage: 'Tables' },
  groupCards: { id: 'juizi-graph-group-cards', defaultMessage: 'Cards' },
  viewBar: { id: 'juizi-graph-view-bar', defaultMessage: 'Bars' },
  viewBarHelp: {
    id: 'juizi-graph-view-bar-help',
    defaultMessage:
      'Compare amounts side by side, such as totals per year or per region.',
  },
  viewBarHorizontal: {
    id: 'juizi-graph-view-bar-horizontal',
    defaultMessage: 'Sideways bars',
  },
  viewBarHorizontalHelp: {
    id: 'juizi-graph-view-bar-horizontal-help',
    defaultMessage:
      'Bars running left to right: good for long labels or a ranking.',
  },
  viewLine: { id: 'juizi-graph-view-line', defaultMessage: 'Line' },
  viewLineHelp: {
    id: 'juizi-graph-view-line-help',
    defaultMessage:
      'Show how figures change over time. Best for long series, such as daily prices.',
  },
  viewArea: { id: 'juizi-graph-view-area', defaultMessage: 'Area' },
  viewAreaHelp: {
    id: 'juizi-graph-view-area-help',
    defaultMessage:
      'A line with the space below it filled in, to show volume over time.',
  },
  viewPie: { id: 'juizi-graph-view-pie', defaultMessage: 'Pie' },
  viewPieHelp: {
    id: 'juizi-graph-view-pie-help',
    defaultMessage:
      'Parts of a whole, as slices. Reads best with up to 8 slices.',
  },
  viewDoughnut: { id: 'juizi-graph-view-doughnut', defaultMessage: 'Doughnut' },
  viewDoughnutHelp: {
    id: 'juizi-graph-view-doughnut-help',
    defaultMessage: 'A pie with a hole in the middle.',
  },
  viewMixed: { id: 'juizi-graph-view-mixed', defaultMessage: 'Bars and line' },
  viewMixedHelp: {
    id: 'juizi-graph-view-mixed-help',
    defaultMessage:
      'Bars for every column except the last, which is drawn as a line over them (for example sales and a growth rate).',
  },
  viewPyramid: {
    id: 'juizi-graph-view-pyramid',
    defaultMessage: 'Population pyramid',
  },
  viewPyramidHelp: {
    id: 'juizi-graph-view-pyramid-help',
    defaultMessage:
      'Two columns back to back, such as men and women per age group. The first goes left, the second right.',
  },
  viewTable: { id: 'juizi-graph-view-table', defaultMessage: 'Table' },
  viewTableHelp: {
    id: 'juizi-graph-view-table-help',
    defaultMessage: 'Your rows and columns as a table.',
  },
  viewSearchableTable: {
    id: 'juizi-graph-view-searchable-table',
    defaultMessage: 'Table with search',
  },
  viewSearchableTableHelp: {
    id: 'juizi-graph-view-searchable-table-help',
    defaultMessage:
      'A table with a search box, so visitors can find a row in a long list.',
  },
  viewStats: { id: 'juizi-graph-view-stats', defaultMessage: 'Key figures' },
  viewStatsHelp: {
    id: 'juizi-graph-view-stats-help',
    defaultMessage:
      'A card per row with its figure in large type. More columns show underneath, with an arrow saying whether they’re higher or lower.',
  },
  viewRankedBars: {
    id: 'juizi-graph-view-ranked-bars',
    defaultMessage: 'Ranked bars',
  },
  viewRankedBarsHelp: {
    id: 'juizi-graph-view-ranked-bars-help',
    defaultMessage:
      'A list with a bar under each item. With three columns, the first groups the rows into separate lists.',
  },
  viewRankedCards: {
    id: 'juizi-graph-view-ranked-cards',
    defaultMessage: 'Top lists',
  },
  viewRankedCardsHelp: {
    id: 'juizi-graph-view-ranked-cards-help',
    defaultMessage:
      'Numbered lists side by side, one card per group. Needs three columns: group, label, figure.',
  },

  // Look
  useNarrow: { id: 'juizi-graph-narrow', defaultMessage: 'Narrow' },
  useNarrowHelp: {
    id: 'juizi-graph-narrow-help',
    defaultMessage: 'Half the usual width, centred.',
  },
  cardsPerRow: {
    id: 'juizi-graph-cards-per-row',
    defaultMessage: 'Cards per row',
  },
  cardColor: { id: 'juizi-graph-card-colour', defaultMessage: 'Card colour' },
  cardColorHelp: {
    id: 'juizi-graph-card-colour-help',
    defaultMessage: 'The text colour follows the card colour automatically.',
  },
  cardAlignment: {
    id: 'juizi-graph-card-alignment',
    defaultMessage: 'Text alignment',
  },
  showBarInCards: {
    id: 'juizi-graph-bars-in-cards',
    defaultMessage: 'Show a bar under each item',
  },
  showBarTrack: {
    id: 'juizi-graph-bar-track',
    defaultMessage: 'Grey line behind the bars',
  },
  showBarTrackHelp: {
    id: 'juizi-graph-bar-track-help',
    defaultMessage: 'Shows how far each bar is from the largest.',
  },
  mobileCarousel: {
    id: 'juizi-graph-mobile-carousel',
    defaultMessage: 'Swipe through cards on phones',
  },
  mobileCarouselHelp: {
    id: 'juizi-graph-mobile-carousel-help',
    defaultMessage:
      'On small screens, one card at a time instead of a long column.',
  },
  showDataLabels: {
    id: 'juizi-graph-data-labels',
    defaultMessage: 'Write the figures on the chart',
  },
  showDataLabelsHelp: {
    id: 'juizi-graph-data-labels-help',
    defaultMessage:
      'Each bar, point or slice gets its figure. Visitors can always point at the chart to see them.',
  },
  dataLabelPosition: {
    id: 'juizi-graph-label-position',
    defaultMessage: 'Where to write them',
  },
  labelEnd: {
    id: 'juizi-graph-label-end',
    defaultMessage: 'Just past the end of each bar',
  },
  labelCentre: {
    id: 'juizi-graph-label-centre',
    defaultMessage: 'In the middle of each bar',
  },
  labelStart: {
    id: 'juizi-graph-label-start',
    defaultMessage: 'Inside, near the start',
  },
  xLabel: { id: 'juizi-graph-x-label', defaultMessage: 'Name under the chart' },
  yLabel: {
    id: 'juizi-graph-y-label',
    defaultMessage: 'Name beside the chart',
  },
  valueAxis: {
    id: 'juizi-graph-value-axis',
    defaultMessage: 'Name for the figures (under the chart)',
  },
  categoryAxis: {
    id: 'juizi-graph-category-axis',
    defaultMessage: 'Name for the labels (beside the chart)',
  },
  axisLabelHelp: {
    id: 'juizi-graph-axis-label-help',
    defaultMessage: 'Optional, for example “Year” or “Rand (millions)”.',
  },
  searchPlaceholderField: {
    id: 'juizi-graph-search-hint',
    defaultMessage: 'Hint in the search box',
  },
  searchPlaceholderHelp: {
    id: 'juizi-graph-search-hint-help',
    defaultMessage:
      'Shown in the empty search box, for example “Search for a town”.',
  },

  // Title and caption
  titleHelp: {
    id: 'juizi-graph-title-help',
    defaultMessage: 'Shown above the chart.',
  },
  caption: { id: 'juizi-graph-caption', defaultMessage: 'Caption' },
  captionHelp: {
    id: 'juizi-graph-caption-help',
    defaultMessage:
      'Shown underneath, for example the source of the figures. Captions are numbered “Figure 1”, “Figure 2” down the page.',
  },
  independent: {
    id: 'juizi-graph-independent',
    defaultMessage: 'Leave out of the figure numbers',
  },
  independentHelp: {
    id: 'juizi-graph-independent-help',
    defaultMessage:
      'The caption gets no “Figure” number, and the next ones don’t count this one.',
  },

  legend: {
    id: 'juizi-graph-legend',
    defaultMessage: 'Key: select an item to hide or show it in the chart',
  },
  // Advanced
  titleLevel: { id: 'juizi-graph-title-level', defaultMessage: 'Title level' },
  titleLevelHelp: {
    id: 'juizi-graph-title-level-help',
    defaultMessage:
      'For screen readers and search engines: how the title fits into the page’s headings. Use “Section heading” when there’s no heading above this chart.',
  },
  titleLevel2: {
    id: 'juizi-graph-title-level-2',
    defaultMessage: 'Section heading',
  },
  titleLevel3: {
    id: 'juizi-graph-title-level-3',
    defaultMessage: 'Under a section heading (usual)',
  },
  titleLevel4: {
    id: 'juizi-graph-title-level-4',
    defaultMessage: 'Under a sub-heading',
  },
  delimiter: {
    id: 'juizi-graph-delimiter',
    defaultMessage: 'What separates the columns in the file',
  },
  delimiterHelp: {
    id: 'juizi-graph-delimiter-help',
    defaultMessage:
      'Usually worked out automatically. Change it only if the columns come out wrong.',
  },
  delimiterAuto: {
    id: 'juizi-graph-delimiter-auto',
    defaultMessage: 'Work it out automatically',
  },
  delimiterSemicolon: {
    id: 'juizi-graph-delimiter-semicolon',
    defaultMessage: 'Semicolons ( ; )',
  },
  delimiterComma: {
    id: 'juizi-graph-delimiter-comma',
    defaultMessage: 'Commas ( , )',
  },
  delimiterTab: { id: 'juizi-graph-delimiter-tab', defaultMessage: 'Tabs' },
  delimiterPipe: {
    id: 'juizi-graph-delimiter-pipe',
    defaultMessage: 'Vertical bars ( | )',
  },
  reverseX: {
    id: 'juizi-graph-reverse-x',
    defaultMessage: 'Flip left and right',
  },
  reverseY: {
    id: 'juizi-graph-reverse-y',
    defaultMessage: 'Flip top and bottom',
  },
  percent: {
    id: 'juizi-graph-percent',
    defaultMessage: 'The figures are percentages',
  },
  percentHelp: {
    id: 'juizi-graph-percent-help',
    defaultMessage:
      'Adds a % sign. Not needed when the figures in your file already have one.',
  },
  countUp: {
    id: 'juizi-graph-count-up',
    defaultMessage: 'Count up the figures',
  },
  countUpHelp: {
    id: 'juizi-graph-count-up-help',
    defaultMessage:
      'The figures count up from zero when the cards come into view. Visitors who turn off motion on their device see the final figures.',
  },
  speedOff: { id: 'juizi-graph-speed-off', defaultMessage: 'Off' },
  speedQuick: { id: 'juizi-graph-speed-quick', defaultMessage: 'Quick' },
  speedNormal: { id: 'juizi-graph-speed-normal', defaultMessage: 'Normal' },
  speedSlow: { id: 'juizi-graph-speed-slow', defaultMessage: 'Slow' },

  // Canvas prompts (editors only)
  startPrompt: {
    id: 'juizi-graph-start',
    defaultMessage:
      'Add your figures under “Your data” in the sidebar, then choose how to show them. Your data can be:',
  },
  chooseFilePrompt: {
    id: 'juizi-graph-choose-file',
    defaultMessage:
      'Choose your CSV file under “CSV file” in the sidebar. Not on the site yet? Save this page, add the file with the Add (+) button in the toolbar, then come back and choose it.',
  },
  pastePrompt: {
    id: 'juizi-graph-paste-prompt',
    defaultMessage:
      'Copy the cells in your spreadsheet, paste them under “Your figures” in the sidebar, and press “Use these figures”.',
  },
  chooseViewPrompt: {
    id: 'juizi-graph-choose-view',
    defaultMessage:
      'Your figures are ready. Choose how to show them under “How to show it” in the sidebar: a chart, a table or cards.',
  },
  needsColumns: {
    id: 'juizi-graph-needs-columns',
    defaultMessage:
      '“{view}” needs at least {count} columns in your data. Choose another way to show it, or add columns to your data.',
  },
  needsNumbers: {
    id: 'juizi-graph-needs-numbers',
    defaultMessage:
      '“{view}” needs figures, but the columns after the first hold text. Choose “Table” instead, or check your data.',
  },
  errorMissing: {
    id: 'juizi-graph-error-missing',
    defaultMessage:
      'The linked file can’t be found. It may have been deleted: choose it again under “CSV file” in the sidebar.',
  },
  errorPrivate: {
    id: 'juizi-graph-error-private',
    defaultMessage:
      'You aren’t allowed to see the linked file. Ask whoever added it, or choose another file.',
  },
  errorTooBig: {
    id: 'juizi-graph-error-too-big',
    defaultMessage:
      'This file is too big to draw on a page (more than 5 MB). Save a shorter version, for example monthly instead of daily figures.',
  },
  errorUnreadable: {
    id: 'juizi-graph-error-unreadable',
    defaultMessage:
      'This file can’t be read as a table. Check that it was saved from your spreadsheet as “CSV”.',
  },
  errorEmpty: {
    id: 'juizi-graph-error-empty',
    defaultMessage:
      'There are no rows of figures in your data, only column names (or nothing at all). Check the file or the pasted cells.',
  },

  // Hints inside the block (editors only)
  filePrivate: {
    id: 'juizi-graph-file-private',
    defaultMessage:
      'Visitors can’t see this file yet, so they won’t see this chart. Publish the file too.',
  },
  thinnedHint: {
    id: 'juizi-graph-thinned',
    defaultMessage:
      'Your file has {total} rows. To keep the page fast, the chart draws {shown} of them, chosen so the line keeps its shape (peaks and dips included).',
  },
  manyBarsHint: {
    id: 'juizi-graph-many-bars',
    defaultMessage:
      'Optional: with this many rows, a line is easier to read than bars.',
  },
  manySlicesHint: {
    id: 'juizi-graph-many-slices',
    defaultMessage:
      'Optional: pies read best with up to 8 slices. Bars or sideways bars may suit these figures better.',
  },
  textColumnsHint: {
    id: 'juizi-graph-text-columns',
    defaultMessage:
      'Optional: columns holding text are left out of the chart. Choose “Table” to show them.',
  },

  // Visitors
  figure: { id: 'juizi-graph-figure', defaultMessage: 'Figure {number}:' },
  showNumbers: {
    id: 'juizi-graph-show-numbers',
    defaultMessage: 'Show the figures as a table',
  },
  chartSummary: {
    id: 'juizi-graph-summary',
    defaultMessage: '{view} of {series} by {category}, {rows} rows',
  },
  truncatedNote: {
    id: 'juizi-graph-truncated',
    defaultMessage: 'Showing the first {shown} of {total} rows.',
  },
  searchLabel: {
    id: 'juizi-graph-search-label',
    defaultMessage: 'Search the table',
  },
  searchPlaceholder: {
    id: 'juizi-graph-search-placeholder',
    defaultMessage: 'Search…',
  },
  searchCount: {
    id: 'juizi-graph-search-count',
    defaultMessage: '{shown} of {total} rows',
  },
  searchNone: {
    id: 'juizi-graph-search-none',
    defaultMessage: 'No rows match your search.',
  },
  direction_up: { id: 'juizi-graph-direction-up', defaultMessage: '(higher)' },
  direction_down: {
    id: 'juizi-graph-direction-down',
    defaultMessage: '(lower)',
  },
  direction_same: {
    id: 'juizi-graph-direction-same',
    defaultMessage: '(the same)',
  },
});
