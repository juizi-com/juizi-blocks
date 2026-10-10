import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../config/colors';
import { translator } from '../../components/Blocks/_shared/i18n';
import {
  backgroundFieldset,
  backgroundProperties,
  panelPosition,
} from '../_shared/background';
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
  const fieldsets = [...schema.fieldsets];
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
  fieldsets.splice(
    panelPosition(fieldsets),
    0,
    backgroundFieldset(t(messages.background), formData),
    formColours,
  );
  const colorChoices = getColorChoices(colors);
  const buttonChoices = getColorChoices(getButtonChoices(colors, t));

  return {
    ...schema,
    fieldsets,
    properties: {
      ...schema.properties,
      ...backgroundProperties(t, formData, colors),
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
