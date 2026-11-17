import chartSVG from './icons/chart.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import View from './View';
import { graphSchema, isConfigured } from './schema';
import ChartTypeWidget from './widgets/ChartTypeWidget';
import PasteTableWidget from './widgets/PasteTableWidget';

export { ChartTypeWidget, PasteTableWidget };

const graph = {
  // The older GraphBlock's id, so its blocks keep rendering.
  id: 'graphBlock',
  title: 'Data visualisation',
  description:
    'Figures from a spreadsheet as a chart, a table or cards, kept up to date with the file.',
  icon: chartSVG,
  view: View,
  edit: makeBlockEdit(View),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: graphSchema,
  isConfigured,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  // Card colours come from the shared colour list (dashboard: Colours per
  // block); chart colours from the dashboard's Chart colours.
  usesColors: true,
  // Sidebar widgets this block's schema uses.
  widgets: {
    juiziChartType: ChartTypeWidget,
    juiziPasteTable: PasteTableWidget,
  },
};

export default graph;
