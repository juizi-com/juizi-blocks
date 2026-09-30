import type { ColorConfig, JuiziBlocksSettings, ThemeSlotName } from './types';

export const SETTINGS_ENDPOINT = '/@juizi-blocks-settings';

export const GET_JUIZI_BLOCKS_SETTINGS = 'GET_JUIZI_BLOCKS_SETTINGS';
export const UPDATE_JUIZI_BLOCKS_SETTINGS = 'UPDATE_JUIZI_BLOCKS_SETTINGS';

/** The CSS variable each theme slot sets: the ones Volto Light Theme
 * blocks read. */
export const THEME_SLOT_VARIABLES: Record<ThemeSlotName, string> = {
  background: '--theme-color',
  foreground: '--theme-foreground-color',
  surface: '--theme-high-contrast-color',
  muted: '--theme-low-contrast-foreground-color',
};

export const LIGHT_FOREGROUND = '#ffffff';
export const DARK_FOREGROUND = '#111111';

/** Mirrors juizi.blocks.settings.DEFAULT_COLOR_CONFIG in the backend. The
 * names come from the previous hard-coded MASTER_COLOR_LIST; the hex values
 * are placeholders to be set in the dashboard. */
export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  colors: [
    { name: 'white', label: 'White', value: '#ffffff', dark: false },
    { name: 'green', label: 'Green', value: '#2e7d32', dark: true },
    { name: 'darkgreen', label: 'Dark Green', value: '#1b4d20', dark: true },
    { name: 'fadedgreen', label: 'Faded Green', value: '#e3f1e4', dark: false },
    { name: 'darkblue', label: 'Blue', value: '#123e6b', dark: true },
    { name: 'fadedblue', label: 'Faded Blue', value: '#e2ecf6', dark: false },
    { name: 'gold', label: 'Gold', value: '#9a7415', dark: true },
    { name: 'fadedgold', label: 'Faded Gold', value: '#f6efdc', dark: false },
  ],
  themes: [
    {
      name: 'default',
      label: 'Default',
      background: { color: 'white' },
      foreground: { color: 'darkblue' },
      surface: { color: 'fadedblue' },
      muted: { color: 'darkblue', opacity: 70 },
    },
    {
      name: 'green',
      label: 'Green',
      background: { color: 'green' },
      foreground: { color: 'white' },
      surface: { color: 'white' },
      muted: { color: 'white', opacity: 70 },
    },
    {
      name: 'faded-blue',
      label: 'Faded Blue',
      background: { color: 'fadedblue' },
      foreground: { color: 'darkblue' },
      surface: { color: 'white' },
      muted: { color: 'darkblue', opacity: 70 },
    },
  ],
  blocks: {},
};

/** Blocks that can never be switched off (their own constraints still
 * apply, e.g. Title is only offered once per page). */
export const LOCKED_BLOCKS = ['slate', 'description', 'image', 'title'];

export const DEFAULT_SETTINGS: JuiziBlocksSettings = {
  disabled_blocks: [],
  enabled_blocks: [],
  color_config: DEFAULT_COLOR_CONFIG,
};
