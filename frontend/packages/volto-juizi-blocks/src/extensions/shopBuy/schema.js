import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../config/colors';
import { getOptionalPaddingProperties } from '../../components/Blocks/_shared/choices';
import { translator } from '../../components/Blocks/_shared/i18n';
import shared from '../../components/Blocks/_shared/messages';
import {
  backgroundFieldset,
  backgroundProperties,
  panelPosition,
} from '../_shared/background';
import messages from './messages';

/**
 * Adds "Background & spacing" and "Button colours" panels to the Buy
 * block's sidebar, after what it sells, as for the donation block. Button
 * colours are empty by default: the site's usual buttons (see Frame.jsx).
 */
const schemaEnhancer = ({ schema, formData = {}, intl }) => {
  const t = translator(intl);
  const colors = getBlockColorList('shopBuy');
  const fieldsets = [...schema.fieldsets];
  const background = backgroundFieldset(t(shared.backgroundSpacing), formData);
  fieldsets.splice(
    panelPosition(fieldsets),
    0,
    {
      ...background,
      fields: [...background.fields, 'paddingTop', 'paddingBottom'],
    },
    {
      id: 'juizi_shop_colours',
      title: t(messages.shopColours),
      description: t(messages.shopColoursHelp),
      fields: ['mainButtonStyle', 'secondButtonStyle', 'highlightColor'],
    },
  );
  const buttonChoices = getColorChoices(getButtonChoices(colors, t));
  return {
    ...schema,
    fieldsets,
    properties: {
      ...schema.properties,
      ...backgroundProperties(t, formData, colors),
      ...getOptionalPaddingProperties(t),
      mainButtonStyle: {
        title: t(messages.mainButton),
        description: t(messages.mainButtonHelp),
        widget: 'select',
        choices: buttonChoices,
      },
      secondButtonStyle: {
        title: t(messages.secondButton),
        widget: 'select',
        choices: buttonChoices,
      },
      highlightColor: {
        title: t(messages.highlightColor),
        description: t(messages.highlightColorHelp),
        widget: 'select',
        choices: getColorChoices(colors),
      },
    },
  };
};

export default schemaEnhancer;
