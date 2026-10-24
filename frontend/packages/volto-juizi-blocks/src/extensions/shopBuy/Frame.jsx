import {
  colorKeyToCssVar,
  getBlockColorList,
  getDefaultButton,
} from '../../config/colors';
import makeBackgroundFrame, {
  buttonVars,
  textOn,
} from '../_shared/BackgroundFrame';

// The button shape every Juizi button has (config/buttons.scss).
const SHAPE = {
  '--shop-button-radius': 'var(--juizi-button-radius, 4px)',
  '--shop-button-border-width': 'var(--juizi-button-border-width, 2px)',
};

/**
 * The shop's colours (the properties collective.shop documents in its
 * extension.js), for the Buy block with its data and for the shop's pages
 * without. Unset choices take the site's usual button colour, as every
 * Juizi block does (getDefaultButton: the first colour that stands out
 * against the background): solid for the main button, outlined for Buy now.
 */
export const shopVars = (data = {}) => {
  const colors = getBlockColorList('shopBuy');
  if (!colors.length) return SHAPE;
  const [, key] = getDefaultButton(
    data.backgroundColor || 'transparent',
    colors,
  ).split('__');
  const accent = data.highlightColor || colorKeyToCssVar(key);
  return {
    ...SHAPE,
    '--shop-accent': accent,
    '--shop-accent-text': textOn(accent),
    ...buttonVars('--shop-main-', data.mainButtonStyle || `solid__${key}`),
    ...buttonVars(
      '--shop-second-',
      data.secondButtonStyle || `outline__${key}`,
    ),
  };
};

/**
 * Background and spacing around the Buy block. Its colours are set by the
 * shop itself from shopVars, so the frame sets none: with no background or
 * padding chosen the block renders as before.
 */
const ShopFrame = makeBackgroundFrame('juizi-shop-frame', () => ({}), {
  padding: true,
});

export default ShopFrame;
