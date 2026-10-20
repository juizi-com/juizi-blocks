import React from 'react';
import {
  colorKeyToCssVar,
  colorValueToKey,
  getColorTextStyle,
  isColorDark,
} from '../../config/colors';
import { DEFAULT_OVERLAY, overlayBackground } from '../../config/gradients';
import { paddingClasses } from '../../components/Blocks/_shared/choices';
import { getPickedImageUrl } from '../../components/Blocks/_shared/images';

// Text colour on a colour from the site list
export const textOn = (color) => getColorTextStyle(color).color || '#fff';

// A stored button style ('solid__key' / 'outline__key', as the other Juizi
// blocks store it) as five custom properties starting with `prefix`
// (e.g. '--donation-next-': background, foreground, border, hover-*).
export const buttonVars = (prefix, value) => {
  const [variant, key] = (value || '').split('__');
  if (!key) return {};
  const color = colorKeyToCssVar(key);
  const foreground = textOn(color);
  return variant === 'outline'
    ? {
        [`${prefix}background`]: 'transparent',
        [`${prefix}foreground`]: color,
        [`${prefix}border`]: color,
        [`${prefix}hover-background`]: color,
        [`${prefix}hover-foreground`]: foreground,
      }
    : {
        [`${prefix}background`]: color,
        [`${prefix}foreground`]: foreground,
        [`${prefix}border`]: color,
        [`${prefix}hover-background`]: `color-mix(in srgb, ${color} 85%, black)`,
        [`${prefix}hover-foreground`]: foreground,
      };
};

/**
 * A Frame for a form block's extension: background colour, and optionally
 * an image over it (a photo, or a pattern), as in the Content Row; the text
 * follows the colour. It also sets the form colours (`colorVars(data)`).
 * With `padding` set it also carries the top and bottom padding chosen
 * (`--pad-top-*` / `--pad-bottom-*`, juizi-common.scss); a side left empty
 * gets `--auto-pad-top` / `--auto-pad-bottom`, the block's usual space.
 * With none of these set the block renders as it did before, unless
 * `always` is set: then the frame is drawn anyway (without a background),
 * for blocks whose layout needs the outer layer.
 * `baseClass` names the frame and its parts (`__bg`, `__overlay`,
 * `--has-bg`); its width comes from $juizi-layers.
 */
const makeBackgroundFrame = (
  baseClass,
  colorVars,
  { always = false, padding = false } = {},
) => {
  const BackgroundFrame = ({ data = {}, children }) => {
    const backgroundColor = data.backgroundColor || 'transparent';
    const hasColor = backgroundColor !== 'transparent';
    const bgImageUrl = getPickedImageUrl(data.backgroundImage);
    const hasBg = hasColor || !!bgImageUrl;
    const vars = colorVars(data);
    const hasPadding = padding && !!(data.paddingTop || data.paddingBottom);
    if (!always && !hasBg && !hasPadding && !Object.keys(vars).length)
      return children;

    const overlay = data.backgroundOverlay || DEFAULT_OVERLAY;
    const overlayCss = overlayBackground(overlay);
    const className = [
      baseClass,
      hasBg && `${baseClass}--has-bg`,
      hasColor && `bg-${colorValueToKey(backgroundColor)}`,
      hasColor && `tone-${isColorDark(backgroundColor) ? 'light' : 'dark'}`,
      ...(padding ? paddingClasses(baseClass, data) : []),
      padding && !data.paddingTop && `${baseClass}--auto-pad-top`,
      padding && !data.paddingBottom && `${baseClass}--auto-pad-bottom`,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={className}
        style={{
          ...vars,
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
              className={`${baseClass}__bg`}
              aria-hidden="true"
              style={{
                backgroundImage: `url(${bgImageUrl})`,
                backgroundPosition: data.backgroundPosition || 'center',
              }}
            />
            {overlayCss && (
              <div
                className={`${baseClass}__overlay`}
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
  return BackgroundFrame;
};

export default makeBackgroundFrame;
