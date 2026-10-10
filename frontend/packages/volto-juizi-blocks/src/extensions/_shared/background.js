import { getColorChoices } from '../../config/colors';
import { getOverlayChoices } from '../../config/gradients';
import shared from '../../components/Blocks/_shared/messages';
// Same fields and wording as the Content Row's background
import contentRowMessages from '../../components/Blocks/ContentRow/messages';

/**
 * The "Background" panel the form-block extensions (donation, membership
 * sign-up) add: a colour from the site list and an image, with the image's
 * position and overlay once one is set.
 */
export const backgroundFieldset = (title, formData = {}) => ({
  id: 'juizi_background',
  title,
  fields: [
    'backgroundColor',
    'backgroundImage',
    ...(formData.backgroundImage?.[0]
      ? ['backgroundPosition', 'backgroundOverlay']
      : []),
  ],
});

export const backgroundProperties = (t, formData = {}, colors) => ({
  backgroundColor: {
    title: t(shared.backgroundColor),
    description: t(contentRowMessages.backgroundColorHelp),
    widget: 'select',
    choices: getColorChoices([
      ['transparent', t(shared.none), 'light'],
      ...colors,
    ]),
    default: 'transparent',
  },
  backgroundImage: {
    title: t(shared.backgroundImage),
    widget: 'object_browser',
    mode: 'image',
    allowExternals: false,
    description: t(contentRowMessages.backgroundImageHelp),
  },
  backgroundPosition: {
    title: t(contentRowMessages.backgroundPosition),
    choices: [
      ['top', t(shared.top)],
      ['center', t(shared.center)],
      ['bottom', t(shared.bottom)],
    ],
    default: 'center',
  },
  backgroundOverlay: {
    title: t(contentRowMessages.backgroundOverlay),
    description: t(contentRowMessages.backgroundOverlayHelp),
    choices: getOverlayChoices(t, formData.backgroundOverlay),
    default: 'gradient',
  },
});

/** Where the extension's panels go: after the side text, else after Default. */
export const panelPosition = (fieldsets) => {
  const after = fieldsets.findIndex((f) => f.id === 'side_text');
  return (
    (after >= 0 ? after : fieldsets.findIndex((f) => f.id === 'default')) + 1
  );
};
