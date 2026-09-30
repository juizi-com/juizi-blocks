import {
  DARK_FOREGROUND,
  DEFAULT_COLOR_CONFIG,
  LIGHT_FOREGROUND,
  THEME_SLOT_VARIABLES,
} from './constants';
import { THEME_SLOTS } from './types';
import type {
  CalloutTypeColors,
  ColorConfig,
  ColorEntry,
  ThemeEntry,
  ThemeSlot,
} from './types';

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAME = /^[a-z][a-z0-9-]{0,39}$/;

export const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && HEX_COLOR.test(value);

export const isValidName = (value: unknown): value is string =>
  typeof value === 'string' && NAME.test(value);

// ─── Colours ───────────────────────────────────────────────────────────────

/** "#abc" / "#aabbcc" / "#aabbccdd" -> [r, g, b] */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Suggests the "dark" flag for a colour: true when white text reads better
 * on it than near-black text. */
export function suggestDark(hex: string) {
  if (!isHexColor(hex)) return false;
  const l = luminance(hex);
  const contrastWithWhite = 1.05 / (l + 0.05);
  const contrastWithBlack = (l + 0.05) / (luminance(DARK_FOREGROUND) + 0.05);
  return contrastWithWhite >= contrastWithBlack;
}

export function colorForeground(entry: ColorEntry) {
  if (isHexColor(entry.foreground)) return entry.foreground;
  return entry.dark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
}

export const colorCssValue = (name: string) => `var(--${name})`;

/** `:root` custom properties for every colour: --name, --name-rgb (for
 * rgba() overlays) and --name-foreground (text on that colour). Entries that
 * would not be safe inside a stylesheet are skipped; the backend rejects
 * them too. */
export function buildColorCss(config: ColorConfig = DEFAULT_COLOR_CONFIG) {
  const declarations = (config.colors || [])
    .filter((c) => isValidName(c?.name) && isHexColor(c.value))
    .map(
      (c) =>
        `--${c.name}:${c.value};--${c.name}-rgb:${hexToRgb(c.value).join(',')};--${c.name}-foreground:${colorForeground(c)};`,
    )
    .join('');
  return declarations ? `:root{${declarations}}` : '';
}

/** The legacy `[value, label, 'dark' | 'light']` tuples block schemas and
 * views use (see config/colors.js). */
export function toColorTuples(colors: ColorEntry[]) {
  return colors
    .filter((c) => isValidName(c?.name))
    .map(
      (c) =>
        [colorCssValue(c.name), c.label, c.dark ? 'dark' : 'light'] as [
          string,
          string,
          'dark' | 'light',
        ],
    );
}

// ─── Themes ────────────────────────────────────────────────────────────────

export function themeSlotCss(slot?: ThemeSlot) {
  if (!slot || !isValidName(slot.color)) return undefined;
  const opacity = slot.opacity ?? 100;
  if (opacity >= 100) return colorCssValue(slot.color);
  return `rgba(var(--${slot.color}-rgb),${Math.max(0, opacity) / 100})`;
}

/** A dashboard theme as a Volto Light Theme style definition. */
export function toVltTheme(theme: ThemeEntry) {
  const style: Record<string, string> = {};
  THEME_SLOTS.forEach((slot) => {
    const css = themeSlotCss(theme[slot]);
    if (css) style[THEME_SLOT_VARIABLES[slot]] = css;
  });
  return { name: theme.name, label: theme.label, style };
}

/** Same as toVltTheme but with literal colours, for previews of unsaved
 * changes (the :root variables only hold saved colours). */
export function themePreviewStyle(theme: ThemeEntry, colors: ColorEntry[]) {
  const style: Record<string, string> = {};
  THEME_SLOTS.forEach((slot) => {
    const value = theme[slot];
    const color = colors.find((c) => c.name === value?.color);
    if (!color || !isHexColor(color.value)) return;
    const opacity = value?.opacity ?? 100;
    style[THEME_SLOT_VARIABLES[slot]] =
      opacity >= 100
        ? color.value
        : `rgba(${hexToRgb(color.value).join(',')},${opacity / 100})`;
  });
  return style;
}

// ─── Per-block narrowing ───────────────────────────────────────────────────

const pick = <T extends { name: string }>(all: T[], allowed?: string[]) =>
  allowed?.length ? all.filter((e) => allowed.includes(e.name)) : all;

export const getBlockColors = (config: ColorConfig, blockType: string) =>
  pick(config?.colors || [], config?.blocks?.[blockType]?.colors);

export const getBlockThemes = (config: ColorConfig, blockType: string) =>
  pick(config?.themes || [], config?.blocks?.[blockType]?.themes);

export function getBlockDefaultTheme(config: ColorConfig, blockType: string) {
  const themes = getBlockThemes(config, blockType);
  const configured = config?.blocks?.[blockType]?.defaultTheme;
  return themes.find((t) => t.name === configured)?.name ?? themes[0]?.name;
}

// ─── Editing ───────────────────────────────────────────────────────────────

/** Turns a label into a name, e.g. "Brand Orange" -> "brand-orange". */
export function slugifyName(label: string, taken: string[] = []) {
  let base = (label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[^a-z]+/, '')
    .replace(/-+$/, '')
    .slice(0, 32);
  if (!base) base = 'colour';
  let name = base;
  let i = 2;
  while (taken.includes(name)) {
    name = `${base}-${i}`;
    i += 1;
  }
  return name;
}

/** `<input type="color">` only understands #rrggbb. */
export function toColorInputValue(value?: string) {
  if (!isHexColor(value)) return '#000000';
  const [r, g, b] = hexToRgb(value);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const mapBlocks = (
  config: ColorConfig,
  fn: (value: ColorConfig['blocks'][string]) => ColorConfig['blocks'][string],
) =>
  Object.fromEntries(
    Object.entries(config.blocks || {}).map(([id, v]) => [id, fn(v)]),
  );

/** Applies `fn` to every colour name in a Callout's per-type colours,
 * dropping the ones it maps to undefined. */
const mapCalloutTypeColors = (
  types: Record<string, CalloutTypeColors>,
  fn: (name: string) => string | undefined,
) =>
  Object.fromEntries(
    Object.entries(types).map(([type, colors]) => [
      type,
      Object.fromEntries(
        Object.entries(colors || {})
          .map(([slot, name]) => [slot, name ? fn(name) : undefined])
          .filter(([, name]) => name),
      ) as CalloutTypeColors,
    ]),
  );

/** Renames a colour everywhere it is referenced (themes, block lists). */
export function renameColor(
  config: ColorConfig,
  from: string,
  to: string,
): ColorConfig {
  const swapSlot = (slot?: ThemeSlot) =>
    slot?.color === from ? { ...slot, color: to } : slot;
  return {
    colors: config.colors.map((c) =>
      c.name === from ? { ...c, name: to } : c,
    ),
    themes: config.themes.map(
      (t) =>
        Object.fromEntries(
          Object.entries(t).map(([k, v]) =>
            (THEME_SLOTS as readonly string[]).includes(k)
              ? [k, swapSlot(v as ThemeSlot)]
              : [k, v],
          ),
        ) as ThemeEntry,
    ),
    blocks: mapBlocks(config, (v) => ({
      ...v,
      colors: (v.colors || []).map((n) => (n === from ? to : n)),
      ...(v.calloutTypes
        ? {
            calloutTypes: mapCalloutTypeColors(v.calloutTypes, (n) =>
              n === from ? to : n,
            ),
          }
        : {}),
    })),
  };
}

/** Removes a colour and the references to it. Theme slots that used it are
 * cleared (the validator then asks for a replacement). */
export function removeColor(config: ColorConfig, name: string): ColorConfig {
  return {
    colors: config.colors.filter((c) => c.name !== name),
    themes: config.themes.map((t) => {
      const next = { ...t };
      THEME_SLOTS.forEach((slot) => {
        if (next[slot]?.color === name) delete next[slot];
      });
      return next;
    }),
    blocks: mapBlocks(config, (v) => ({
      ...v,
      colors: (v.colors || []).filter((n) => n !== name),
      ...(v.calloutTypes
        ? {
            calloutTypes: mapCalloutTypeColors(v.calloutTypes, (n) =>
              n === name ? undefined : n,
            ),
          }
        : {}),
    })),
  };
}

export function renameTheme(
  config: ColorConfig,
  from: string,
  to: string,
): ColorConfig {
  return {
    ...config,
    themes: config.themes.map((t) =>
      t.name === from ? { ...t, name: to } : t,
    ),
    blocks: mapBlocks(config, (v) => ({
      ...v,
      themes: (v.themes || []).map((n) => (n === from ? to : n)),
      ...(v.defaultTheme
        ? { defaultTheme: v.defaultTheme === from ? to : v.defaultTheme }
        : {}),
    })),
  };
}

export function removeTheme(config: ColorConfig, name: string): ColorConfig {
  return {
    ...config,
    themes: config.themes.filter((t) => t.name !== name),
    blocks: mapBlocks(config, ({ defaultTheme, ...v }) => ({
      ...v,
      themes: (v.themes || []).filter((n) => n !== name),
      ...(defaultTheme && defaultTheme !== name ? { defaultTheme } : {}),
    })),
  };
}

/** Problems the backend would reject, so the dashboard can show them before
 * saving. Empty when the config is fine. */
export function validateColorConfig(config: ColorConfig): string[] {
  const errors: string[] = [];
  const colors = config?.colors || [];
  const themes = config?.themes || [];
  if (!colors.length) errors.push('Add at least one colour.');
  if (!themes.length) errors.push('Add at least one theme.');

  const names = colors.map((c) => c.name);
  const checkNames = (
    entries: { name: string; label: string }[],
    kind: string,
  ) => {
    const seen = new Set<string>();
    entries.forEach((e, i) => {
      const label = e.label || `${kind} #${i + 1}`;
      if (!isValidName(e.name)) {
        errors.push(
          `${kind} "${label}": the name must start with a letter and only use lowercase letters, digits and dashes.`,
        );
      } else if (seen.has(e.name)) {
        errors.push(`${kind} "${label}": the name "${e.name}" is used twice.`);
      }
      seen.add(e.name);
    });
  };
  checkNames(colors, 'Colour');
  checkNames(themes, 'Theme');

  colors.forEach((c) => {
    if (!isHexColor(c.value)) {
      errors.push(`Colour "${c.label}": the value must be a hex colour.`);
    }
    if (c.foreground && !isHexColor(c.foreground)) {
      errors.push(
        `Colour "${c.label}": the text colour must be a hex colour or empty.`,
      );
    }
  });
  themes.forEach((t) => {
    (['background', 'foreground'] as const).forEach((slot) => {
      if (!t[slot]?.color) {
        errors.push(`Theme "${t.label}": pick a ${slot} colour.`);
      }
    });
    THEME_SLOTS.forEach((slot) => {
      const value = t[slot];
      if (value?.color && !names.includes(value.color)) {
        errors.push(`Theme "${t.label}": the ${slot} colour no longer exists.`);
      }
    });
  });
  return errors;
}

/** WCAG contrast ratio between two hex colours (1 to 21). */
export function contrastRatio(a: string, b: string) {
  if (!isHexColor(a) || !isHexColor(b)) return 1;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
