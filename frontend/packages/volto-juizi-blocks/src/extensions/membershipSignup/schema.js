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
 * Adds "Background" and "Form colours" panels to the membership sign-up
 * block's sidebar, after its layout and text panels, as for the donation
 * block. Form colours are empty by default: the site's usual look.
 */
const schemaEnhancer = ({ schema, formData = {}, intl }) => {
  const t = translator(intl);
  const colors = getBlockColorList('membershipSignup');
  const fieldsets = [...schema.fieldsets];
  fieldsets.splice(
    panelPosition(fieldsets),
    0,
    backgroundFieldset(t(messages.background), formData),
    {
      id: 'juizi_form_colours',
      title: t(messages.formColours),
      description: t(messages.formColoursHelp),
      fields: ['highlightColor', 'mainButtonStyle'],
    },
  );
  return {
    ...schema,
    fieldsets,
    properties: {
      ...schema.properties,
      ...backgroundProperties(t, formData, colors),
      highlightColor: {
        title: t(messages.highlightColor),
        description: t(messages.highlightColorHelp),
        widget: 'select',
        choices: getColorChoices(colors),
      },
      mainButtonStyle: {
        title: t(messages.mainButton),
        description: t(messages.mainButtonHelp),
        widget: 'select',
        choices: getColorChoices(getButtonChoices(colors, t)),
      },
    },
  };
};

export default schemaEnhancer;
