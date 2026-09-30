// ============================================================================
// colors.js — Single source of truth for all block colours and buttons
// src/config/colors.js
//
// OVERVIEW
// --------
// Every colour used in any block schema picker or View component must come
// through this file. Raw hex values and inline colour decisions are
// prohibited in block code.
//
// This file is used in both edit (CMS) and view (public) contexts. It has
// no browser dependencies (no window/document references) and is SSR-safe.
//
// WHERE THE COLOURS COME FROM
// ---------------------------
// The colours are managed in Site Setup > Juizi Blocks (the dashboard), not
// in code. Each colour has a name, a label, a hex value, a "dark" flag and an
// optional text colour. SettingsLoader outputs them as CSS variables:
//   --<name>             the colour           e.g. --green: #2e7d32
//   --<name>-rgb         its r,g,b channels   for rgba() overlays
//   --<name>-foreground  the text colour to use on it
//
// MASTER_COLOR_LIST FORMAT
// ------------------------
// Each entry: ['var(--name)', 'Label', 'dark' | 'light']
//
//   value     — The CSS variable reference stored in block data and applied
//               as an inline style. Changing a colour in the dashboard updates
//               every block that stored it, without touching block data.
//   label     — Human-readable name shown in the editor dropdown.
//   lightness — 'dark' colours get light text, 'light' colours dark text.
//               isColorDark() and getButtonClasses() use this.
//
// MASTER_COLOR_LIST is updated in place when the settings load or change, so
// read it at render time (inside schema functions and components), never
// copy it at module level.
//
// PER-BLOCK COLOUR LISTS
// ----------------------
// The dashboard can narrow which colours each block offers. In block schemas
// use getBlockColorList('<blockType>') instead of MASTER_COLOR_LIST:
//   const colors = getBlockColorList('contentRow');
//   choices: getColorChoices(colors)
//
// ORDER MATTERS
// -------------
// getDefaultButton() finds the first entry matching a target lightness, so
// the order of colours in the dashboard decides the default button styles.
//

import {
  MASTER_COLOR_LIST,
  getBlockColorList,
  getColorForeground,
} from '../settings/runtime';

import { isHexColor, suggestDark } from '../settings/helpers';
import { normalizeButtonStyle, normalizeColorValue } from '../legacy/colors';
import messages from '../components/Blocks/_shared/messages';
import { translator } from '../components/Blocks/_shared/i18n';

export { MASTER_COLOR_LIST, getBlockColorList };

// Older block add-ons also saved raw hex colours and a few malformed
// values; the helpers below accept those too (see legacy/colors.js).
const CSS_COLOR_KEYWORDS = ['white', 'black', 'transparent'];
const HEX_KEY = /^(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// ─── getColorChoices ──────────────────────────────────────────────────────────
// Returns [value, label] pairs for Volto select widgets (drops the lightness).
// Use for background colour pickers in block schemas.
//
// Note: this strips the lightness value. Do not use getColorChoices output
// as a colour list — always pass the full MASTER_COLOR_LIST to functions that
// need lightness (isColorDark, getButtonChoices, getDefaultButton).
//
// Example:
//   backgroundColor: {
//     widget: 'select',
//     choices: getColorChoices(bgList),   // bgList includes 'transparent' prepended
//   }
export const getColorChoices = (list = MASTER_COLOR_LIST) =>
  list.map(([value, label]) => [value, label]);

// ─── isColorDark ─────────────────────────────────────────────────────────────
// Returns true if the colour is dark and therefore needs white/light text.
// Returns false for light colours (needs dark text) AND for unregistered values.
//
// Important: returns false (treats as light) for any value not in the list.
// If you use a colour that is not in MASTER_COLOR_LIST or your extended list,
// it will silently be treated as light — you may get dark text on a dark
// background. Always add colours to the list before using them.
//
// Usage in View components:
//   const isDark = isColorDark(data.backgroundColor);
//   wrapperClasses.push(isDark ? 'bg-dark' : 'bg-light');
//   // Then in CSS: .bg-dark { color: #fff; } .bg-light { color: var(--dark); }
export const isColorDark = (value, list = MASTER_COLOR_LIST) => {
  const normalized = normalizeColorValue(value);
  const match = list.find(([v]) => v === normalized);
  if (match) return match[2] === 'dark';
  // A hex colour that isn't in the list: judge it by its own lightness.
  return isHexColor(normalized) ? suggestDark(normalized) : false;
};

// ─── getColorTextStyle ───────────────────────────────────────────────────────
// Inline style giving an element the text colour the dashboard sets for its
// background colour. Returns {} for 'transparent' and unknown values.
//
// Usage in View components:
//   style={{ backgroundColor: bg, ...getColorTextStyle(bg) }}
export const getColorTextStyle = (value) => {
  if (!value || value === 'transparent') return {};
  const normalized = normalizeColorValue(value);
  const color =
    getColorForeground(normalized) ||
    (isHexColor(normalized)
      ? suggestDark(normalized)
        ? '#ffffff'
        : '#111111'
      : undefined);
  return color ? { color } : {};
};

// ─── colorValueToKey ─────────────────────────────────────────────────────────
// Converts a CSS variable value or hex to a safe key for class names and
// button value storage.
//
//   'var(--primary-blue)' → 'primary-blue'
//   '#ffffff'             → 'ffffff'
//   'transparent'         → 'transparent'
//
// Used internally by getButtonChoices and getButtonClasses to build the
// 'variant__colorKey' button value format.
export const colorValueToKey = (value) =>
  value
    .replace(/var\(--/, '')
    .replace(/\)/, '')
    .replace(/^#/, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .toLowerCase();

// ─── colorKeyToCssVar ────────────────────────────────────────────────────────
// Reverse of colorValueToKey: given a key, returns its original CSS variable
// or hex value from the list.
//
//   'primary-blue' → 'var(--primary-blue)'   (if in list)
//   'ffffff'       → '#ffffff'               (if in list)
//   'unknown-key'  → 'unknown-key'           (fallback: returns key as-is)
//
// Used by getButtonClasses to convert the stored colorKey back to a CSS
// variable for the --btn-color custom property.
export const colorKeyToCssVar = (key, colorList = MASTER_COLOR_LIST) => {
  const match = colorList.find(([value]) => colorValueToKey(value) === key);
  if (match) return match[0];
  // Keys of colours that aren't in the list (older content): a hex key was
  // a hex colour, a keyword stays a keyword, anything else is a CSS variable
  // the site may define (add it to the dashboard colours to manage it).
  if (HEX_KEY.test(key)) return `#${key}`;
  if (CSS_COLOR_KEYWORDS.includes(key)) return key;
  return /^[a-z][a-z0-9-]*$/i.test(key) ? `var(--${key})` : key;
};

// ─── getButtonChoices ────────────────────────────────────────────────────────
// Generates solid + outlined button choices from the colour list.
// Returns three-element tuples: [storedValue, label, lightness]
//
// Unlike getColorChoices, this preserves the lightness as the third element.
// Do NOT pass getButtonChoices output to getColorChoices — they have different
// tuple shapes and are for different purposes.
//
// Each colour produces two entries:
//   ['solid__white',   'White — Solid',    'light']
//   ['outline__white', 'White — Outlined', 'light']
//
// The "Solid" / "Outlined" part of the label is translated: pass the schema's
// translator (components/Blocks/_shared/i18n.js) as the second argument.
//
// Usage in block schemas:
//   buttonStyle: {
//     widget: 'select',
//     choices: getButtonChoices(MASTER_COLOR_LIST, t),
//     default: getDefaultButton(data.backgroundColor, MASTER_COLOR_LIST),
//   }
export const getButtonChoices = (
  colorList = MASTER_COLOR_LIST,
  t = translator(),
) =>
  colorList.flatMap(([value, label, lightness]) => {
    const key = colorValueToKey(value);
    return [
      [`solid__${key}`, t(messages.buttonSolid, { color: label }), lightness],
      [
        `outline__${key}`,
        t(messages.buttonOutlined, { color: label }),
        lightness,
      ],
    ];
  });

// ─── getDefaultButton ────────────────────────────────────────────────────────
// Returns the most appropriate default button style for a given background colour.
//
// Logic:
//   - Dark background → suggests an outlined version of the first light colour
//   - Light background → suggests an outlined version of the first dark colour
//   - Unknown/null background → treated as light (suggests first dark colour)
//
// This means default buttons always contrast with the block background without
// the editor needing to choose. Editors can override in the schema picker.
//
// Order dependency: uses the FIRST matching colour of the target lightness.
// If your list has no dark colours, or all dark colours are at the end, the
// fallback is the first colour in the list (outlined). Keep primary colours
// near the top.
//
// Usage:
//   default: getDefaultButton(data.backgroundColor, MASTER_COLOR_LIST)
export const getDefaultButton = (
  bgColorValue,
  colorList = MASTER_COLOR_LIST,
) => {
  const bgEntry = colorList.find(([value]) => value === bgColorValue);
  const bgLightness = bgEntry?.[2] ?? 'light';

  const targetLightness = bgLightness === 'dark' ? 'light' : 'dark';
  const preferredColor = colorList.find(([, , l]) => l === targetLightness);
  const fallback = colorList[0];

  const key = colorValueToKey((preferredColor ?? fallback)[0]);
  return `outline__${key}`;
};

// ─── getContrastingColor ─────────────────────────────────────────────────────
// The first colour in the list whose lightness is opposite to the background
// (a transparent or unknown background counts as light). For defaults of
// details that must stand out against the block, e.g. the Gallery's
// highlight around the current thumbnail. Mirrors getDefaultButton.
//
//   default: getContrastingColor(data.backgroundColor, colors)
export const getContrastingColor = (
  bgColorValue,
  colorList = MASTER_COLOR_LIST,
) => {
  const bgEntry = colorList.find(([value]) => value === bgColorValue);
  const bgLightness = bgEntry?.[2] ?? 'light';
  const target = bgLightness === 'dark' ? 'light' : 'dark';
  const match = colorList.find(([, , l]) => l === target) ?? colorList[0];
  return match?.[0];
};

// ─── getButtonClasses ────────────────────────────────────────────────────────
// The main output function — call this in View components to get a button's
// className and inline style from a stored button style value.
//
// Parameters:
//   value     — stored button style value (e.g. 'solid__white', 'outline__blue')
//               If empty or not in 'variant__key' format, returns a plain
//               className with the value appended (safe fallback).
//   baseClass — the block's button CSS class (e.g. 'hero-button', 'card-button')
//
// Returns:
//   className — space-separated string of classes:
//     '{baseClass}'            — the block's own button class (for sizing/layout)
//     'btn-unified'            — marks it as a system button (target all at once)
//     'btn-{variant}'          — 'btn-solid' or 'btn-outline'
//     'btn-color-{colorKey}'   — e.g. 'btn-color-white', 'btn-color-blue'
//     '{baseClass}--{variant}' — e.g. 'hero-button--solid' (block-local targeting)
//
//   style     — inline style object:
//     '--btn-color'      — the CSS variable for this button's colour
//     '--btn-foreground' — #fff for dark colours, #111 for light colours
//                         Use var(--btn-foreground) in buttons.scss for text
//                         colour — never hardcode it.
//
// Usage:
//   const { className, style } = getButtonClasses(item.buttonStyle, 'hero-button');
//   return <a href={href} className={className} style={style}>{label}</a>;
//
// CSS targeting examples:
//   .btn-unified                { /* all system buttons across all blocks */ }
//   .btn-solid                  { /* all solid buttons */ }
//   .btn-outline                { /* all outlined buttons */ }
//   .btn-color-white            { /* white buttons across all blocks */ }
//   .hero-button.btn-solid      { /* solid buttons in the hero block only */ }
//
// Registering a new block's button class:
//   Add the baseClass value to $block-btn-classes in config/buttons.scss:
//   $block-btn-classes: 'hero-button', 'card-button', 'my-new-button';
export const getButtonClasses = (rawValue = '', baseClass = 'button') => {
  // Also accepts the older 'white-outline' / 'primary-filled' format.
  const value = normalizeButtonStyle(rawValue);
  if (value && value.includes('__')) {
    const [variant, colorKey] = value.split('__');
    const cssVar = colorKeyToCssVar(colorKey);
    const match = MASTER_COLOR_LIST.find(
      ([v]) => colorValueToKey(v) === colorKey,
    );
    const isDark = match ? match[2] === 'dark' : isColorDark(cssVar);
    // The dashboard sets a text colour per colour; fall back to the lightness.
    const foreground =
      (match && getColorForeground(match[0])) || (isDark ? '#fff' : '#111');
    return {
      className: [
        baseClass,
        'btn-unified',
        `btn-${variant}`,
        `btn-color-${colorKey}`,
        `${baseClass}--${variant}`,
      ].join(' '),
      style: {
        '--btn-color': cssVar,
        '--btn-foreground': foreground,
      },
    };
  }
  return { className: `${baseClass} ${value}`.trim(), style: {} };
};
