import React from 'react';
import {
  colorKeyToCssVar,
  colorValueToKey,
  getColorTextStyle,
  isColorDark,
} from '../../config/colors';
import { DEFAULT_OVERLAY, overlayBackground } from '../../config/gradients';
import { getPickedImageUrl } from '../../components/Blocks/_shared/images';

// Text colour on a colour from the site list
const textOn = (color) => getColorTextStyle(color).color || '#fff';

// A stored button style ('solid__key' / 'outline__key', as the other Juizi
// blocks store it) as the donation block's --donation-{name}-* properties
const buttonVars = (name, value) => {
  const [variant, key] = (value || '').split('__');
  if (!key) return {};
  const color = colorKeyToCssVar(key);
  const foreground = textOn(color);
  const p = `--donation-${name}-`;
  return variant === 'outline'
    ? {
        [`${p}background`]: 'transparent',
        [`${p}foreground`]: color,
        [`${p}border`]: color,
        [`${p}hover-background`]: color,
        [`${p}hover-foreground`]: foreground,
      }
    : {
        [`${p}background`]: color,
        [`${p}foreground`]: foreground,
        [`${p}border`]: color,
        [`${p}hover-background`]: `color-mix(in srgb, ${color} 85%, black)`,
        [`${p}hover-foreground`]: foreground,
      };
};

/** The "Form colours" choices as the donation block's colour properties. */
export const formColorVars = (data = {}) => ({
  ...(data.stepColor && {
    '--donation-step-active': data.stepColor,
    '--donation-step-active-foreground': textOn(data.stepColor),
  }),
  ...(data.highlightColor && { '--donation-highlight': data.highlightColor }),
  ...buttonVars('next', data.nextButtonStyle),
  ...buttonVars('back', data.backButtonStyle),
});

/**
 * Background around the donation block: a colour, and optionally an image
 * over it (a photo, or a pattern), as in the Content Row. The text follows
 * the colour. Also carries the "Form colours" (see formColorVars). With
 * none of these set the block renders as it did before.
 */
const DonationFrame = ({ data = {}, children }) => {
  const backgroundColor = data.backgroundColor || 'transparent';
  const hasColor = backgroundColor !== 'transparent';
  const bgImageUrl = getPickedImageUrl(data.backgroundImage);
  const hasBg = hasColor || !!bgImageUrl;
  const colorVars = formColorVars(data);
  if (!hasBg && !Object.keys(colorVars).length) return children;

  const overlay = data.backgroundOverlay || DEFAULT_OVERLAY;
  const overlayCss = overlayBackground(overlay);
  const className = [
    'juizi-donation-frame',
    hasBg && 'juizi-donation-frame--has-bg',
    hasColor && `bg-${colorValueToKey(backgroundColor)}`,
    hasColor && `tone-${isColorDark(backgroundColor) ? 'light' : 'dark'}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      style={{
        ...colorVars,
        ...(hasColor && {
          backgroundColor,
          ...getColorTextStyle(backgroundColor),
        }),
      }}
    >
      {bgImageUrl && (
        <>
          {/* Decorative, so hidden from screen readers */}
          <div
            className="juizi-donation-frame__bg"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${bgImageUrl})`,
              backgroundPosition: data.backgroundPosition || 'center',
            }}
          />
          {overlayCss && (
            <div
              className="juizi-donation-frame__overlay"
              aria-hidden="true"
              style={overlayCss}
            />
          )}
        </>
      )}
      {children}
    </div>
  );
};

export default DonationFrame;
