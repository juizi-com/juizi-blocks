import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../config/colors';
import { getOverlayChoices } from '../../config/gradients';
import { translator } from '../../components/Blocks/_shared/i18n';
import shared from '../../components/Blocks/_shared/messages';
// Same fields and wording as the Content Row's background
import contentRowMessages from '../../components/Blocks/ContentRow/messages';
import messages from './messages';

/**
 * Adds "Background" and "Form colours" panels to the donation block's
 * sidebar, after the layout and text panels (the order an editor works
 * through the block). Form colours are left empty by default, which keeps
 * the site theme's colours.
 */
const schemaEnhancer = ({ schema, formData = {}, intl }) => {
  const t = translator(intl);
  const colors = getBlockColorList('donationBlock');
  const hasBgImage = !!formData.backgroundImage?.[0];

  const background = {
    id: 'juizi_background',
    title: t(messages.background),
    fields: [
      'backgroundColor',
      'backgroundImage',
      ...(hasBgImage ? ['backgroundPosition', 'backgroundOverlay'] : []),
    ],
  };
  const fieldsets = [...schema.fieldsets];
  const after = fieldsets.findIndex((f) => f.id === 'side_text');
  const at =
    (after >= 0 ? after : fieldsets.findIndex((f) => f.id === 'default')) + 1;
  const formColours = {
    id: 'juizi_form_colours',
    title: t(messages.formColours),
    description: t(messages.formColoursHelp),
    fields: [
      'stepColor',
      'highlightColor',
      'nextButtonStyle',
      'backButtonStyle',
    ],
  };
  fieldsets.splice(at, 0, background, formColours);
  const colorChoices = getColorChoices(colors);
  const buttonChoices = getColorChoices(getButtonChoices(colors, t));

  return {
    ...schema,
    fieldsets,
    properties: {
      ...schema.properties,
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
      stepColor: {
        title: t(messages.stepColor),
        description: t(messages.stepColorHelp),
        widget: 'select',
        choices: colorChoices,
      },
      highlightColor: {
        title: t(messages.highlightColor),
        description: t(messages.highlightColorHelp),
        widget: 'select',
        choices: colorChoices,
      },
      nextButtonStyle: {
        title: t(messages.nextButton),
        description: t(messages.nextButtonHelp),
        widget: 'select',
        choices: buttonChoices,
      },
      backButtonStyle: {
        title: t(messages.backButton),
        widget: 'select',
        choices: buttonChoices,
      },
    },
  };
};

export default schemaEnhancer;
