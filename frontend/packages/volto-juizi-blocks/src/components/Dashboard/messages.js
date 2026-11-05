import { defineMessages } from 'react-intl';

export default defineMessages({
  title: { id: 'juizi-dashboard-title', defaultMessage: 'Juizi Blocks' },
  intro: {
    id: 'juizi-dashboard-intro',
    defaultMessage:
      'Switch blocks on or off, manage the colours every block shares, and build the block themes from them.',
  },
  // Blocks
  blocks: { id: 'juizi-dashboard-blocks', defaultMessage: 'Blocks' },
  blocksHelp: {
    id: 'juizi-dashboard-blocks-help',
    defaultMessage:
      'Every block registered in this site, grouped as in the block chooser. Switched-off blocks disappear from the chooser; blocks already on pages keep rendering. New blocks appear here automatically after a rebuild, switched on unless their own settings keep them off.',
  },
  editingLanguage: {
    id: 'juizi-dashboard-editing-language',
    defaultMessage: 'Editing language',
  },
  editingLanguageHelp: {
    id: 'juizi-dashboard-editing-language-help',
    defaultMessage:
      "The language of the Juizi blocks' sidebar and editing hints, whatever the page's language: handy when you build a site in a language you don't read. Visitors always see the page's language. Set it back to \"Same as the page\" when the site launches.",
  },
  editingLanguageFollow: {
    id: 'juizi-dashboard-editing-language-follow',
    defaultMessage: 'Same as the page',
  },
  enabled: { id: 'juizi-dashboard-enabled', defaultMessage: 'Enabled' },
  disabled: { id: 'juizi-dashboard-disabled', defaultMessage: 'Disabled' },
  resetBlocks: {
    id: 'juizi-dashboard-reset-blocks',
    defaultMessage: 'Reset all to their defaults',
  },
  tabBlocks: { id: 'juizi-dashboard-tab-blocks', defaultMessage: 'Blocks' },
  tabColors: { id: 'juizi-dashboard-tab-colors', defaultMessage: 'Colours' },
  tabPrint: { id: 'juizi-dashboard-tab-print', defaultMessage: 'Print' },
  advanced: { id: 'juizi-dashboard-advanced', defaultMessage: 'Advanced' },
  printButton: {
    id: 'juizi-dashboard-print-button',
    defaultMessage: 'Print button',
  },
  printButtonHelp: {
    id: 'juizi-dashboard-print-button-help',
    defaultMessage:
      'The colour and style of every Print button on the site. Editors can choose a different one on a single button.',
  },
  printButtonAutomatic: {
    id: 'juizi-dashboard-print-button-automatic',
    defaultMessage: 'Automatic (stands out against the page)',
  },
  printSampleButton: {
    id: 'juizi-dashboard-print-sample-button',
    defaultMessage: 'Print',
  },
  printHeader: {
    id: 'juizi-dashboard-print-header',
    defaultMessage: 'Top of the printout',
  },
  printHeaderHelp: {
    id: 'juizi-dashboard-print-header-help',
    defaultMessage:
      'Printed above the page: a logo on the left, and up to two lines of text on the right. Leave a line empty to leave it out.',
  },
  printLogo: { id: 'juizi-dashboard-print-logo', defaultMessage: 'Logo' },
  printLogoSite: {
    id: 'juizi-dashboard-print-logo-site',
    defaultMessage: 'The site’s logo',
  },
  printLogoCustom: {
    id: 'juizi-dashboard-print-logo-custom',
    defaultMessage: 'Another picture',
  },
  printLogoNone: {
    id: 'juizi-dashboard-print-logo-none',
    defaultMessage: 'No logo',
  },
  printLogoUrl: {
    id: 'juizi-dashboard-print-logo-url',
    defaultMessage: 'Picture’s address',
  },
  printLogoUrlHelp: {
    id: 'juizi-dashboard-print-logo-url-help',
    defaultMessage:
      'The address of a picture on this site (starting with /, for example /images/print-logo.png), or a full web address starting with https://. Upload the picture to the site first.',
  },
  printHeading: {
    id: 'juizi-dashboard-print-heading',
    defaultMessage: 'First line (in bold)',
  },
  printSubheading: {
    id: 'juizi-dashboard-print-subheading',
    defaultMessage: 'Second line',
  },
  printPlaceholders: {
    id: 'juizi-dashboard-print-placeholders',
    defaultMessage:
      'Type any text, and use these words in square brackets to fill in details of the page being printed:',
  },
  printPlaceholderTitle: {
    id: 'juizi-dashboard-print-placeholder-title',
    defaultMessage: 'the page’s title',
  },
  printPlaceholderSection: {
    id: 'juizi-dashboard-print-placeholder-section',
    defaultMessage:
      'the section the page is in, one level below the main menu (for example “Risk Alert”)',
  },
  printPlaceholderPublicationDate: {
    id: 'juizi-dashboard-print-placeholder-publication-date',
    defaultMessage: 'the page’s publication date',
  },
  printPlaceholderToday: {
    id: 'juizi-dashboard-print-placeholder-today',
    defaultMessage: 'the day it’s printed',
  },
  printPlaceholderSiteName: {
    id: 'juizi-dashboard-print-placeholder-site-name',
    defaultMessage: 'the site’s name',
  },
  printPlaceholderPageAddress: {
    id: 'juizi-dashboard-print-placeholder-page-address',
    defaultMessage: 'the page’s web address',
  },
  printFooter: {
    id: 'juizi-dashboard-print-footer',
    defaultMessage: 'Bottom of the printout',
  },
  printFooterHelp: {
    id: 'juizi-dashboard-print-footer-help',
    defaultMessage:
      'A line printed below the page. The same words in square brackets work here. Leave it empty for no line.',
  },
  printFooterText: {
    id: 'juizi-dashboard-print-footer-text',
    defaultMessage: 'Text',
  },
  printPaper: { id: 'juizi-dashboard-print-paper', defaultMessage: 'Paper' },
  printPaperHelp: {
    id: 'juizi-dashboard-print-paper-help',
    defaultMessage:
      'The paper the printout is laid out for. People can still choose another in their printer’s settings.',
  },
  printPaperSize: {
    id: 'juizi-dashboard-print-paper-size',
    defaultMessage: 'Paper size',
  },
  printOrientation: {
    id: 'juizi-dashboard-print-orientation',
    defaultMessage: 'Orientation',
  },
  printPortrait: {
    id: 'juizi-dashboard-print-portrait',
    defaultMessage: 'Portrait (upright)',
  },
  printLandscape: {
    id: 'juizi-dashboard-print-landscape',
    defaultMessage: 'Landscape (sideways)',
  },
  printLeftOut: {
    id: 'juizi-dashboard-print-left-out',
    defaultMessage: 'Left out of the printout',
  },
  printLeftOutHelp: {
    id: 'juizi-dashboard-print-left-out-help',
    defaultMessage:
      'Ticked kinds of content aren’t printed, for example videos and maps that don’t work on paper. The site’s menus, header and footer are always left out.',
  },
  printCustomLayout: {
    id: 'juizi-dashboard-print-custom-layout',
    defaultMessage: 'Custom layout (for your web team)',
  },
  printCustomLayoutHelp: {
    id: 'juizi-dashboard-print-custom-layout-help',
    defaultMessage:
      'HTML that replaces the top or bottom of the printout set above. The same words in square brackets work, and [logo] gives the logo’s address. Scripts are removed.',
  },
  printCustomHeader: {
    id: 'juizi-dashboard-print-custom-header',
    defaultMessage: 'Top of the printout (HTML)',
  },
  printCustomFooter: {
    id: 'juizi-dashboard-print-custom-footer',
    defaultMessage: 'Bottom of the printout (HTML)',
  },
  groupCount: {
    id: 'juizi-dashboard-group-count',
    defaultMessage: '{on} of {total} on',
  },
  locked: {
    id: 'juizi-dashboard-locked',
    defaultMessage: 'Always on',
  },
  contextual: {
    id: 'juizi-dashboard-contextual',
    defaultMessage:
      'Only offered where the block allows it (e.g. certain content types)',
  },
  offByDefault: {
    id: 'juizi-dashboard-off-by-default',
    defaultMessage: 'Off by default in its own settings',
  },
  groupsSummary: {
    id: 'juizi-dashboard-groups-summary',
    defaultMessage: 'Who can add it: {groups}',
  },
  everybody: {
    id: 'juizi-dashboard-groups-everybody',
    defaultMessage: 'Everybody',
  },
  groupsHelp: {
    id: 'juizi-dashboard-groups-help',
    defaultMessage:
      'Only members of the ticked groups are offered {title}. Tick none to offer it to everybody.',
  },
  noGroups: {
    id: 'juizi-dashboard-groups-none',
    defaultMessage: 'This site has no user groups yet.',
  },
  allowEverybody: {
    id: 'juizi-dashboard-groups-allow-everybody',
    defaultMessage: 'Offer to everybody',
  },
  // Colours
  colors: { id: 'juizi-dashboard-colors', defaultMessage: 'Colours' },
  colorsHelp: {
    id: 'juizi-dashboard-colors-help',
    defaultMessage:
      'The master colour list. Blocks store a colour by name (var(--name)), so changing a value here updates every block that uses it. Renaming a colour does not update blocks that already use the old name.',
  },
  addColor: { id: 'juizi-dashboard-add-color', defaultMessage: 'Add colour' },
  newColor: { id: 'juizi-dashboard-new-color', defaultMessage: 'New colour' },
  label: { id: 'juizi-dashboard-label', defaultMessage: 'Label' },
  name: { id: 'juizi-dashboard-name', defaultMessage: 'Name' },
  value: { id: 'juizi-dashboard-value', defaultMessage: 'Colour' },
  dark: { id: 'juizi-dashboard-dark', defaultMessage: 'Dark colour' },
  darkHelp: {
    id: 'juizi-dashboard-dark-help',
    defaultMessage:
      'Dark colours get light text and light default buttons, and vice versa.',
  },
  suggested: {
    id: 'juizi-dashboard-suggested',
    defaultMessage: 'Suggested: {tone}',
  },
  useSuggestion: {
    id: 'juizi-dashboard-use-suggestion',
    defaultMessage: 'Use suggestion',
  },
  toneDark: { id: 'juizi-dashboard-tone-dark', defaultMessage: 'dark' },
  toneLight: { id: 'juizi-dashboard-tone-light', defaultMessage: 'light' },
  foreground: {
    id: 'juizi-dashboard-foreground',
    defaultMessage: 'Text colour',
  },
  automatic: { id: 'juizi-dashboard-automatic', defaultMessage: 'Automatic' },
  contrast: {
    id: 'juizi-dashboard-contrast',
    defaultMessage: 'Contrast {ratio}:1',
  },
  lowContrast: {
    id: 'juizi-dashboard-low-contrast',
    defaultMessage: 'Low contrast: text may be hard to read.',
  },
  // Themes
  themes: { id: 'juizi-dashboard-themes', defaultMessage: 'Block themes' },
  themesHelp: {
    id: 'juizi-dashboard-themes-help',
    defaultMessage:
      "The Volto Light Theme background options (Styling > Background color) offered by VLT's own blocks, such as Grid, Teaser, Text and Listing. Juizi blocks use the colour list above instead. Each part picks a colour from that list, optionally faded.",
  },
  addTheme: { id: 'juizi-dashboard-add-theme', defaultMessage: 'Add theme' },
  newTheme: { id: 'juizi-dashboard-new-theme', defaultMessage: 'New theme' },
  slot_background: {
    id: 'juizi-dashboard-slot-background',
    defaultMessage: 'Background',
  },
  slot_foreground: {
    id: 'juizi-dashboard-slot-foreground',
    defaultMessage: 'Text',
  },
  slot_surface: {
    id: 'juizi-dashboard-slot-surface',
    defaultMessage: 'Cards / surfaces',
  },
  slot_muted: {
    id: 'juizi-dashboard-slot-muted',
    defaultMessage: 'Muted text',
  },
  none: { id: 'juizi-dashboard-none', defaultMessage: '— None —' },
  opacity: { id: 'juizi-dashboard-opacity', defaultMessage: 'Opacity %' },
  previewTitle: {
    id: 'juizi-dashboard-preview-title',
    defaultMessage: 'Preview heading',
  },
  previewText: {
    id: 'juizi-dashboard-preview-text',
    defaultMessage: 'Muted supporting text',
  },
  previewCard: { id: 'juizi-dashboard-preview-card', defaultMessage: 'Card' },
  // Per block
  colorsPerBlock: {
    id: 'juizi-dashboard-colors-per-block',
    defaultMessage: 'Colours per block',
  },
  colorsPerBlockHelp: {
    id: 'juizi-dashboard-colors-per-block-help',
    defaultMessage:
      'Tick the colours each block offers in its colour and button pickers. With nothing ticked, the block offers every colour.',
  },
  themesPerBlock: {
    id: 'juizi-dashboard-themes-per-block',
    defaultMessage: 'Themes per block',
  },
  themesPerBlockHelp: {
    id: 'juizi-dashboard-themes-per-block-help',
    defaultMessage:
      'Tick the themes each theme-aware block offers. With nothing ticked, the block offers every theme.',
  },
  block: { id: 'juizi-dashboard-block', defaultMessage: 'Block' },
  calloutTypes: {
    id: 'juizi-dashboard-callout-types',
    defaultMessage: 'Callout types',
  },
  calloutTypesHelp: {
    id: 'juizi-dashboard-callout-types-help',
    defaultMessage:
      'The colours a callout starts with when an editor chooses its type. Editors can still change them per callout. Leave a colour as None for no colour.',
  },
  calloutType: { id: 'juizi-dashboard-callout-type', defaultMessage: 'Type' },
  calloutBackground: {
    id: 'juizi-dashboard-callout-background',
    defaultMessage: 'Background colour',
  },
  calloutIconColor: {
    id: 'juizi-dashboard-callout-icon-color',
    defaultMessage: 'Icon colour',
  },
  all: { id: 'juizi-dashboard-all', defaultMessage: 'All' },
  defaultTheme: {
    id: 'juizi-dashboard-default-theme',
    defaultMessage: 'Default',
  },
  // Shared
  remove: { id: 'juizi-dashboard-remove', defaultMessage: 'Remove' },
  moveUp: { id: 'juizi-dashboard-move-up', defaultMessage: 'Move up' },
  moveDown: { id: 'juizi-dashboard-move-down', defaultMessage: 'Move down' },
  save: { id: 'juizi-dashboard-save', defaultMessage: 'Save' },
  cancel: { id: 'juizi-dashboard-cancel', defaultMessage: 'Discard changes' },
  back: { id: 'juizi-dashboard-back', defaultMessage: 'Back' },
  saved: { id: 'juizi-dashboard-saved', defaultMessage: 'Changes saved' },
  printNotSaved: {
    id: 'juizi-dashboard-print-not-saved',
    defaultMessage: 'The print settings weren’t saved',
  },
  printNotSupported: {
    id: 'juizi-dashboard-print-not-supported',
    defaultMessage:
      'This site’s server needs an update before print settings can be kept (Juizi Blocks on the server, then its upgrade in Site Setup › Add-ons). Until then printouts use the standard settings shown here, and changes on this tab aren’t kept. Changes on the other tabs are saved as usual.',
  },
  saveFailed: {
    id: 'juizi-dashboard-save-failed',
    defaultMessage: 'Could not save the settings',
  },
  loadFailed: {
    id: 'juizi-dashboard-load-failed',
    defaultMessage:
      'Could not load the Juizi Blocks settings. Is juizi.blocks installed on the site?',
  },
  notInstalled: {
    id: 'juizi-dashboard-not-installed',
    defaultMessage:
      'Juizi Blocks is not installed on this site. Install it in Site Setup → Add-ons to add its blocks to pages and use this dashboard.',
  },
  unsaved: {
    id: 'juizi-dashboard-unsaved',
    defaultMessage: 'You have unsaved changes.',
  },
  fixErrors: {
    id: 'juizi-dashboard-fix-errors',
    defaultMessage: 'Fix these before saving:',
  },
  // Problems found by validateColorConfig (settings/helpers.ts): the key is
  // `error` + the issue's code.
  errorNoColors: {
    id: 'juizi-dashboard-error-no-colors',
    defaultMessage: 'Add at least one colour.',
  },
  errorNoThemes: {
    id: 'juizi-dashboard-error-no-themes',
    defaultMessage: 'Add at least one theme.',
  },
  errorColorName: {
    id: 'juizi-dashboard-error-color-name',
    defaultMessage:
      'Colour “{label}”: the name must start with a letter and only use lowercase letters, digits and dashes.',
  },
  errorThemeName: {
    id: 'juizi-dashboard-error-theme-name',
    defaultMessage:
      'Theme “{label}”: the name must start with a letter and only use letters, digits and dashes.',
  },
  errorColorDuplicate: {
    id: 'juizi-dashboard-error-color-duplicate',
    defaultMessage: 'Colour “{label}”: the name “{name}” is used twice.',
  },
  errorThemeDuplicate: {
    id: 'juizi-dashboard-error-theme-duplicate',
    defaultMessage: 'Theme “{label}”: the name “{name}” is used twice.',
  },
  errorColorValue: {
    id: 'juizi-dashboard-error-color-value',
    defaultMessage: 'Colour “{label}”: the value must be a hex colour.',
  },
  errorColorForeground: {
    id: 'juizi-dashboard-error-color-foreground',
    defaultMessage:
      'Colour “{label}”: the text colour must be a hex colour or empty.',
  },
  errorThemeSlotMissing: {
    id: 'juizi-dashboard-error-theme-slot-missing',
    defaultMessage: 'Theme “{label}”: choose a colour for “{slot}”.',
  },
  errorThemeSlotGone: {
    id: 'juizi-dashboard-error-theme-slot-gone',
    defaultMessage:
      'Theme “{label}”: the colour chosen for “{slot}” no longer exists.',
  },
  // Stand-ins for a colour or theme without a label.
  unnamedColor: {
    id: 'juizi-dashboard-unnamed-color',
    defaultMessage: 'Colour {number}',
  },
  unnamedTheme: {
    id: 'juizi-dashboard-unnamed-theme',
    defaultMessage: 'Theme {number}',
  },
  // Export and import
  tabTransfer: {
    id: 'juizi-dashboard-tab-transfer',
    defaultMessage: 'Export and import',
  },
  transferExport: {
    id: 'juizi-dashboard-transfer-export',
    defaultMessage: 'Export',
  },
  transferExportHelp: {
    id: 'juizi-dashboard-transfer-export-help',
    defaultMessage:
      "Download this site's saved settings as a file: blocks, editing language, colours and themes, and print settings. Import the file on another site to give it the same settings.",
  },
  transferExportUnsaved: {
    id: 'juizi-dashboard-transfer-export-unsaved',
    defaultMessage:
      'You have unsaved changes. The file holds the saved settings, without them: save first if you want them in it.',
  },
  transferExportButton: {
    id: 'juizi-dashboard-transfer-export-button',
    defaultMessage: 'Download settings',
  },
  transferImport: {
    id: 'juizi-dashboard-transfer-import',
    defaultMessage: 'Import',
  },
  transferImportHelp: {
    id: 'juizi-dashboard-transfer-import-help',
    defaultMessage:
      'Take settings from a file exported on another site. You choose which parts to take. They replace the same parts here as unsaved changes: look them over on the other tabs, then Save, or Discard changes to keep what you had.',
  },
  transferChooseFile: {
    id: 'juizi-dashboard-transfer-choose-file',
    defaultMessage: 'Choose a file…',
  },
  transferFrom: {
    id: 'juizi-dashboard-transfer-from',
    defaultMessage: '“{name}”, exported from {site} on {date}.',
  },
  transferChoose: {
    id: 'juizi-dashboard-transfer-choose',
    defaultMessage: 'Parts to import',
  },
  transferImportButton: {
    id: 'juizi-dashboard-transfer-import-button',
    defaultMessage: 'Import the chosen parts',
  },
  transferCancel: {
    id: 'juizi-dashboard-transfer-cancel',
    defaultMessage: 'Cancel',
  },
  transferImported: {
    id: 'juizi-dashboard-transfer-imported',
    defaultMessage:
      'Imported: {parts}. Nothing is saved yet: check the other tabs, then Save.',
  },
  transferNothing: {
    id: 'juizi-dashboard-transfer-nothing',
    defaultMessage: 'This file has no settings that can be imported.',
  },
  transferPartInvalid: {
    id: 'juizi-dashboard-transfer-part-invalid',
    defaultMessage:
      '“{part}” in this file is damaged or incomplete, so it can’t be imported.',
  },
  transferMissingGroups: {
    id: 'juizi-dashboard-transfer-missing-groups',
    defaultMessage:
      'Some blocks in this file are limited to user groups this site doesn’t have: {groups}. Nobody will be offered those blocks until you create the groups or change who can add them.',
  },
  transferNotJson: {
    id: 'juizi-dashboard-transfer-not-json',
    defaultMessage: '“{name}” can’t be read: it isn’t a settings file.',
  },
  transferNotOurs: {
    id: 'juizi-dashboard-transfer-not-ours',
    defaultMessage:
      '“{name}” isn’t a Juizi Blocks settings file. Use a file made with “Download settings”.',
  },
  transferNewerFormat: {
    id: 'juizi-dashboard-transfer-newer-format',
    defaultMessage:
      '“{name}” was exported by a newer version of Juizi Blocks. Update this site first.',
  },
  transferPartBlocks: {
    id: 'juizi-dashboard-transfer-part-blocks',
    defaultMessage: 'Blocks switched on or off, and who can add them',
  },
  transferPartLanguage: {
    id: 'juizi-dashboard-transfer-part-language',
    defaultMessage: 'Editing language',
  },
  transferPartColors: {
    id: 'juizi-dashboard-transfer-part-colors',
    defaultMessage: 'Colours and themes, and which blocks offer them',
  },
  transferPartPrint: {
    id: 'juizi-dashboard-transfer-part-print',
    defaultMessage: 'Print settings',
  },
});
