/**
 * Chart colours, as hex values (ECharts writes them into the SVG, where
 * CSS variables don't work in fill attributes).
 *
 * Set in Site Setup → Juizi Blocks → Colours → Chart colours, as an ordered
 * list of the site's colours (`color_config.blocks.graphBlock.chartColors`).
 * Not set: the site's colours in their order, without the very light ones
 * (backgrounds such as white or faded tints, which vanish on a white page).
 * Charts needing more colours than the list has repeat it with a lighter
 * shade, so neighbouring series still differ.
 */
export const BLOCK_ID = 'graphBlock';

const FALLBACK = ['#123e6b', '#2e7d32', '#9a7415', '#7b1fa2', '#c62828'];

const channels = (hex) => {
  let value = String(hex || '').replace('#', '');
  if (value.length === 3 || value.length === 4) {
    value = value
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-f]{6}/i.test(value)) return null;
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
};

/** WCAG relative luminance, 0 (black) to 1 (white). */
export const luminance = (hex) => {
  const rgb = channels(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Mix a colour with white: 0 = unchanged, 1 = white. */
export const tint = (hex, amount) => {
  const rgb = channels(hex);
  if (!rgb) return hex;
  const mixed = rgb.map((c) => Math.round(c + (255 - c) * amount));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
};

/** The ordered chart colours for a site's colour configuration. */
export const getChartPalette = (colorConfig) => {
  const colors = colorConfig?.colors || [];
  const byName = Object.fromEntries(colors.map((c) => [c.name, c.value]));
  const chosen = (colorConfig?.blocks?.[BLOCK_ID]?.chartColors || [])
    .map((name) => byName[name])
    .filter(Boolean);
  if (chosen.length) return chosen;
  const visible = colors
    .map((c) => c.value)
    .filter((value) => channels(value) && luminance(value) < 0.7);
  return visible.length ? visible : FALLBACK;
};

/** `count` colours from the palette, repeating it in lighter shades. */
export const pickColors = (palette, count) => {
  const base = palette.length ? palette : FALLBACK;
  return Array.from({ length: count }, (_, i) => {
    const round = Math.floor(i / base.length);
    const color = base[i % base.length];
    return round === 0 ? color : tint(color, Math.min(0.25 * round, 0.75));
  });
};
