/**
 * Applies the Juizi Blocks settings to the running app.
 *
 * Block schemas, views and Volto Light Theme read colours and themes
 * synchronously (from `config` or plain function calls), not from Redux, so
 * the saved settings are copied into module state and `config` at three
 * points, all before anything renders with them:
 *
 * - server: when the SSR asyncPropsExtender has fetched the settings;
 * - browser: at startup, from the Redux state the server serialised into
 *   `window.__data` (so hydration sees exactly what the server rendered);
 * - browser: whenever the settings change afterwards (dashboard save).
 *
 * The settings are site-wide, so sharing this state between concurrent SSR
 * requests is fine.
 */
import config from '@plone/volto/registry';
import { DEFAULT_COLOR_CONFIG } from './constants';
import {
  getBlockColors,
  getBlockDefaultTheme,
  getBlockThemes,
  toColorTuples,
  toVltTheme,
} from './helpers';
import { wrapBlocksRestricted } from './toggles';
import type { BlockLists } from './toggles';
import type { ColorConfig, JuiziBlocksSettings } from './types';

type ColorTuple = [string, string, 'dark' | 'light'];

let blockLists: BlockLists = { disabled_blocks: [], enabled_blocks: [] };
let colorConfig: ColorConfig = DEFAULT_COLOR_CONFIG;
let themedBlocks: string[] = [];

/**
 * The master colour list as `[value, label, lightness]` tuples. This array is
 * updated in place, so modules holding a reference to it (and default
 * parameters in config/colors.js) always see the current colours.
 */
export const MASTER_COLOR_LIST: ColorTuple[] = toColorTuples(
  DEFAULT_COLOR_CONFIG.colors,
);

/** Called once by the add-on config with the block types that use VLT
 * themes, so their per-block theme lists can be applied. */
export function registerThemedBlocks(blockTypes: string[]) {
  themedBlocks = blockTypes;
}

export function setRuntimeSettings(settings?: Partial<JuiziBlocksSettings>) {
  if (!settings) return;
  blockLists = {
    disabled_blocks: settings.disabled_blocks || [],
    enabled_blocks: settings.enabled_blocks || [],
  };
  // Every registered block gets the dashboard switch. Repeated on each call
  // so blocks registered by add-ons loaded after this one are covered too.
  wrapBlocksRestricted(config.blocks?.blocksConfig, () => blockLists);
  if (!settings.color_config) return;
  colorConfig = settings.color_config;

  MASTER_COLOR_LIST.splice(
    0,
    MASTER_COLOR_LIST.length,
    ...toColorTuples(colorConfig.colors),
  );

  config.blocks.themes = colorConfig.themes.map(toVltTheme);
  const blocksConfig = config.blocks.blocksConfig as Record<string, any>;
  themedBlocks.forEach((blockType) => {
    const blockConfig = blocksConfig[blockType];
    if (!blockConfig) return;
    const restricted = colorConfig.blocks?.[blockType]?.themes?.length;
    blockConfig.themes = restricted
      ? getBlockThemes(colorConfig, blockType).map(toVltTheme)
      : undefined;
    blockConfig.defaultTheme = getBlockDefaultTheme(colorConfig, blockType);
  });
}

export const getRuntimeColorConfig = () => colorConfig;

/** Switched off in the dashboard. */
export function isBlockDisabled(blockType: string) {
  return blockLists.disabled_blocks.includes(blockType);
}

/** The colours a block type may offer, as `[value, label, lightness]`. */
export function getBlockColorList(blockType: string): ColorTuple[] {
  return toColorTuples(getBlockColors(colorConfig, blockType));
}

/** Text colour for a stored colour value (`var(--name)`). */
export function getColorForeground(value: string) {
  const match = /^var\(--([a-z][a-z0-9-]*)\)$/.exec(value || '');
  return match ? `var(--${match[1]}-foreground)` : undefined;
}

/**
 * The colours a Callout type starts with, as stored block values
 * (`var(--name)`), from the dashboard's "Callout types" table. Colours that
 * no longer exist are skipped.
 */
export function getCalloutTypeColors(type: string): {
  backgroundColor?: string;
  iconColor?: string;
} {
  const entry = colorConfig.blocks?.juiziCallout?.calloutTypes?.[type] || {};
  const known = new Set((colorConfig.colors || []).map((c) => c.name));
  const toValue = (name?: string) =>
    name && known.has(name) ? `var(--${name})` : undefined;
  const result: { backgroundColor?: string; iconColor?: string } = {};
  const backgroundColor = toValue(entry.background);
  const iconColor = toValue(entry.icon);
  if (backgroundColor) result.backgroundColor = backgroundColor;
  if (iconColor) result.iconColor = iconColor;
  return result;
}
