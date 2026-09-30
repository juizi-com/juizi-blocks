/**
 * Image overlays (Hero backgrounds, Content Row image cards). An intentional
 * exception to the colour list: this is image compositing, not a background
 * colour choice.
 */
import messages from './messages';
import { translator } from './i18n';

const TINTS = [
  ['black', messages.overlayBlack],
  ['white', messages.overlayWhite],
  ['primary', messages.overlayBrand],
];
const STRENGTHS = [
  [30, messages.overlayLight],
  [50, messages.overlayMedium],
  [70, messages.overlayDark],
];

/** Overlay choices for a schema; `t` is the schema's translator. */
export const getOverlayChoices = (t = translator()) => [
  ['gradient', t(messages.overlayGradient)],
  ['none', t(messages.none)],
  ...TINTS.flatMap(([tint, color]) =>
    STRENGTHS.map(([percent, strength]) => [
      `${tint}-${percent}`,
      t(messages.overlayTint, {
        color: t(color),
        strength: t(strength),
        percent,
      }),
    ]),
  ),
];

const OVERLAY_RGBA = {
  'black-30': 'rgba(0,0,0,0.3)',
  'black-50': 'rgba(0,0,0,0.5)',
  'black-70': 'rgba(0,0,0,0.7)',
  'white-30': 'rgba(255,255,255,0.3)',
  'white-50': 'rgba(255,255,255,0.5)',
  'white-70': 'rgba(255,255,255,0.7)',
  'primary-30': 'rgba(var(--accent-color-rgb),0.3)',
  'primary-50': 'rgba(var(--accent-color-rgb),0.5)',
  'primary-70': 'rgba(var(--accent-color-rgb),0.7)',
};

/** Inline rgba for a tint overlay; null for 'none', 'gradient' (CSS) or
 * unknown values. */
export const overlayStyleToRgba = (overlayStyle) =>
  OVERLAY_RGBA[overlayStyle] ?? null;
