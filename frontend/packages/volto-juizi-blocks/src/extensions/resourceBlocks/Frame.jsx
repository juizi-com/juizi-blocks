import { getBlockColorList, getDefaultButton } from '../../config/colors';
import makeBackgroundFrame, {
  buttonVars,
  textOn,
} from '../_shared/BackgroundFrame';

/** Text over a background image, which can't be judged automatically. The
 * default overlay darkens the picture, so it starts light. */
export const imageTextVars = (data = {}) => {
  if (!data.backgroundImage?.[0]) return {};
  const light = data.imageText !== 'dark';
  return {
    '--resource-text': light ? '#fff' : '#111',
    '--resource-muted': 'currentColor',
    '--resource-rule': light
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(0, 0, 0, 0.3)',
  };
};

const align = (data) => (data.alignment ? { textAlign: data.alignment } : {});

/** A solid button in the colour the site's outlined default would use. */
const defaultMainButton = (data) => {
  const colors = getBlockColorList('resourceActions');
  if (!colors.length) return null;
  const [, key] = getDefaultButton(
    data.backgroundColor || 'transparent',
    colors,
  ).split('__');
  return { main: `solid__${key}`, second: `outline__${key}` };
};

export const actionsVars = (data = {}) => {
  const defaults = defaultMainButton(data);
  return {
    ...align(data),
    '--resource-button-radius': 'var(--juizi-button-radius, 4px)',
    '--resource-button-border-width': 'var(--juizi-button-border-width, 2px)',
    ...buttonVars('--resource-main-', data.mainButtonStyle || defaults?.main),
    ...buttonVars(
      '--resource-second-',
      data.secondButtonStyle || defaults?.second,
    ),
  };
};

export const typeVars = (data = {}) => {
  const color = data.labelColor;
  return {
    ...align(data),
    ...(color && {
      '--resource-tag-background': color,
      '--resource-tag-foreground': textOn(color),
      '--resource-tag-padding': '0.2em 0.6em',
      '--resource-tag-display': 'inline-block',
    }),
  };
};

export const factsVars = (data = {}) =>
  data.factsLabels === 'above'
    ? {
        '--resource-facts-columns': '1fr',
        '--resource-facts-gap': '0.75rem 0',
      }
    : {};

// Always drawn: the frame's inner layer is what lines a block up with the
// page title, and these blocks have no layout of their own.
const frame = (colorVars = () => ({})) =>
  makeBackgroundFrame(
    'juizi-resource-frame',
    (data) => ({ ...imageTextVars(data), ...colorVars(data) }),
    { always: true, padding: true },
  );
const plain = frame();

/**
 * Around each resource block. The add-on puts its content in
 * `.resource-block-inner`, the frame's inner layer, and reads the properties
 * set here (they're listed in its blockExtension.js). The download button
 * always gets the site's button; nothing else changes until it's chosen.
 */
const Frames = {
  resourceType: frame(typeVars),
  resourceFacts: frame(factsVars),
  resourceActions: frame(actionsVars),
  resourceAbstract: plain,
  resourceKeyFindings: plain,
};

export default Frames;
