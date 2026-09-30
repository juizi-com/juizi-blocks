/**
 * Image overlays (Hero backgrounds, Content Row image cards). An intentional
 * exception to the colour list: this is image compositing, not a background
 * colour choice.
 */
export const overlayChoices = [
  ['gradient', 'Gradient (default)'],
  ['none', 'None'],
  ['black-30', 'Black — Light (30%)'],
  ['black-50', 'Black — Medium (50%)'],
  ['black-70', 'Black — Dark (70%)'],
  ['white-30', 'White — Light (30%)'],
  ['white-50', 'White — Medium (50%)'],
  ['white-70', 'White — Dark (70%)'],
  ['primary-30', 'Brand colour — Light (30%)'],
  ['primary-50', 'Brand colour — Medium (50%)'],
  ['primary-70', 'Brand colour — Dark (70%)'],
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
