import printerSVG from '@plone/volto/icons/printer.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import View from './View';
import { printButtonSchema } from './schema';

const printButton = {
  // The id of the Print Report block sites already have (CRA), so their
  // saved blocks become this one without being edited.
  id: 'printReport',
  title: 'Print button',
  description:
    'A button visitors click to print the page, with the site’s header and footer on the printout.',
  icon: printerSVG,
  view: View,
  edit: makeBlockEdit(View),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: printButtonSchema,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  // Button colours from the shared colour list (dashboard: Colours per block).
  usesColors: true,
};

export default printButton;
