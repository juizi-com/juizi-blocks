import { getBlockColorList, getButtonChoices } from '../../../config/colors';
import blockMessages from '../../../blocks/messages';
import { getAlignmentChoices } from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

/**
 * Sidebar: the button's text, its look and where it sits. Everything about
 * the printout itself is set once for the site in the dashboard. No schema
 * defaults: empty fields follow the site's settings.
 */
export const printButtonSchema = (args = {}) => {
  const t = translator(args.intl);
  return {
    title: t(blockMessages.printButton),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: ['label', 'buttonStyle', 'align'],
      },
    ],
    properties: {
      label: {
        title: t(shared.buttonText),
        description: t(messages.labelHelp),
        placeholder: t(messages.print),
      },
      buttonStyle: {
        title: t(shared.buttonStyle),
        description: t(messages.buttonStyleHelp),
        widget: 'select',
        choices: getButtonChoices(getBlockColorList('printReport'), t),
        placeholder: t(messages.siteStyle),
      },
      align: {
        title: t(messages.position),
        description: t(messages.positionHelp),
        widget: 'select',
        choices: getAlignmentChoices(t),
        placeholder: t(shared.right),
      },
    },
    required: [],
  };
};
