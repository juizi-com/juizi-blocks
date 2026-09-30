/**
 * Normalises colour and button-style values saved by earlier block add-ons
 * so they work with the current colour system (config/colors.js):
 *
 * - `var(--turquoise`       → `var(--turquoise)` (missing parenthesis)
 * - `white-outline`         → `outline__white`   (nithecs button styles)
 * - `primary-filled`        → `solid__primary`
 * - `solid__x` / `outline__x` and plain values are returned unchanged.
 *
 * Raw hex colours (`#ffffff`) are kept as they are: config/colors.js works
 * out their lightness and text colour itself.
 */

const UNCLOSED_VAR = /^var\(--([a-z0-9-]+)\s*$/i;
const LEGACY_BUTTON = /^([a-z0-9-]+?)-(outline|filled)$/i;

export function normalizeColorValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const unclosed = UNCLOSED_VAR.exec(trimmed);
  return unclosed ? `var(--${unclosed[1]})` : trimmed;
}

export function normalizeButtonStyle(value) {
  if (typeof value !== 'string' || !value || value.includes('__')) {
    return value;
  }
  const legacy = LEGACY_BUTTON.exec(value.trim());
  if (!legacy) return value;
  const [, color, variant] = legacy;
  return `${variant === 'filled' ? 'solid' : 'outline'}__${color.toLowerCase()}`;
}
