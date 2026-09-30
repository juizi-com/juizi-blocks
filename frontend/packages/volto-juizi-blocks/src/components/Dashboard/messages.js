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
  enabled: { id: 'juizi-dashboard-enabled', defaultMessage: 'Enabled' },
  disabled: { id: 'juizi-dashboard-disabled', defaultMessage: 'Disabled' },
  resetBlocks: {
    id: 'juizi-dashboard-reset-blocks',
    defaultMessage: 'Reset all to their defaults',
  },
  tabBlocks: { id: 'juizi-dashboard-tab-blocks', defaultMessage: 'Blocks' },
  tabColors: { id: 'juizi-dashboard-tab-colors', defaultMessage: 'Colours' },
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
  saveFailed: {
    id: 'juizi-dashboard-save-failed',
    defaultMessage: 'Could not save the settings',
  },
  loadFailed: {
    id: 'juizi-dashboard-load-failed',
    defaultMessage:
      'Could not load the Juizi Blocks settings. Is juizi.blocks installed on the site?',
  },
  unsaved: {
    id: 'juizi-dashboard-unsaved',
    defaultMessage: 'You have unsaved changes.',
  },
  fixErrors: {
    id: 'juizi-dashboard-fix-errors',
    defaultMessage: 'Fix these before saving:',
  },
});
