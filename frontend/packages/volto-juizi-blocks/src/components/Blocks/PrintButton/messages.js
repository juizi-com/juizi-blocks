import { defineMessages } from 'react-intl';

// Print button block: the button, the sidebar, and the editor's hint.
export default defineMessages({
  print: { id: 'juizi-print', defaultMessage: 'Print' },
  preparing: { id: 'juizi-print-preparing', defaultMessage: 'Preparing…' },
  editHint: {
    id: 'juizi-print-edit-hint',
    defaultMessage:
      'Visitors click this to print the page. The printout’s header, footer, paper size and the parts left out are set for the whole site in Site Setup › Juizi Blocks › Print.',
  },
  labelHelp: {
    id: 'juizi-print-label-help',
    defaultMessage: 'Leave empty for “Print”.',
  },
  buttonStyleHelp: {
    id: 'juizi-print-button-style-help',
    defaultMessage:
      'Leave empty to use the site’s print button style, set in Site Setup › Juizi Blocks › Print.',
  },
  position: { id: 'juizi-print-position', defaultMessage: 'Position' },
  positionHelp: {
    id: 'juizi-print-position-help',
    defaultMessage:
      'Right puts the button beside the text that follows it. Leave empty for right.',
  },
  siteStyle: {
    id: 'juizi-print-site-style',
    defaultMessage: 'The site’s print button style',
  },
});
