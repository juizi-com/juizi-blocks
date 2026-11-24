/**
 * Colours on the calendar's white card, following ACCESSIBILITY rules:
 * coloured text only where it reads at 4.5:1 or better, and an outline on
 * any dot or bar under 3:1.
 */
import { getBlockColorList } from '../../../config/colors';
import { isHexColor, luminance } from '../../../settings/helpers';
import { getRuntimeColorConfig } from '../../../settings/runtime';
import { OTHER } from './events';

export const BLOCK_TYPE = 'juiziCalendar';
export const INK = '#1d2433';
export const NEUTRAL = '#5b6475';
const CARD = '#ffffff';
// How much of a label's colour is in its background (as in the stylesheet).
const TINT = 0.12;
// Dots also sit on the pale grey of other months and on the tint.
const DOT_MINIMUM = 3.4;

const fullHex = (hex) =>
  hex.length === 4
    ? `#${[...hex.slice(1)].map((char) => char + char).join('')}`
    : hex.slice(0, 7);

/** A list colour's hex, or '' when it can't be judged. */
export const toHex = (value) => {
  if (!value) return '';
  if (isHexColor(value)) return fullHex(value);
  const name = /^var\(--([a-z][a-z0-9-]*)\)$/.exec(value)?.[1];
  const colour = (getRuntimeColorConfig()?.colors || []).find(
    (entry) => entry.name === name,
  );
  return colour && isHexColor(colour.value) ? fullHex(colour.value) : '';
};

export const contrast = (one, other) => {
  const [high, low] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
};

const tint = (hex) =>
  `#${[1, 3, 5]
    .map((at) => parseInt(hex.slice(at, at + 2), 16))
    .map((part) => Math.round(part * TINT + 255 * (1 - TINT)))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('')}`;

export const readsOnWhite = (value) => {
  const hex = toHex(value);
  return !!hex && contrast(hex, CARD) >= 4.5;
};

/** The colours given to types that have none of their own. */
const automaticColours = () =>
  getBlockColorList(BLOCK_TYPE)
    .map(([value]) => value)
    .filter(readsOnWhite);

/** The buttons', today's and the selected day's colour. */
export const accentColour = (chosen) => {
  if (chosen) return readsOnWhite(chosen) ? chosen : INK;
  return automaticColours()[0] || INK;
};

export const typeStyle = (value) => {
  const hex = toHex(value);
  return {
    '--event-color': value,
    '--event-tag': hex && contrast(hex, CARD) >= 4.5 ? value : INK,
    '--event-text': hex && contrast(hex, tint(hex)) >= 4.5 ? value : INK,
    '--event-edge':
      hex && contrast(hex, CARD) >= DOT_MINIMUM ? 'transparent' : NEUTRAL,
  };
};

export const isPale = (value) => {
  const hex = toHex(value);
  return !!hex && contrast(hex, CARD) < DOT_MINIMUM;
};

/** The types with a colour and style each, "Other events" last in grey. */
export const styleTypes = (types, otherLabel) => {
  const automatic = automaticColours();
  return types.map((type, index) => {
    const other = type.id === OTHER;
    const color = other
      ? NEUTRAL
      : type.color || automatic[index % automatic.length] || NEUTRAL;
    return {
      ...type,
      label: other ? otherLabel : type.label,
      color,
      style: typeStyle(color),
    };
  });
};
