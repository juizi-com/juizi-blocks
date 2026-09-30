import { schemaData } from '../../BlockEdit/BlockEdit';
import blockMessages from '../../../blocks/messages';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';
import { getRedirectUrl } from './redirectTarget';

// Called as ({ intl, props, data, formData }) by makeBlockEdit.
// `url` keeps the field name saved redirects already use. The page name is
// offered once there's a destination to name.
export const redirectSchema = (args = {}) => {
  const t = translator(args.intl);
  const data = schemaData(args);
  return {
    title: t(blockMessages.redirect),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: ['url', ...(getRedirectUrl(data) ? ['pageName'] : [])],
      },
    ],
    properties: {
      url: {
        title: t(messages.sendTo),
        description: t(messages.sendToHelp),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        multi: false,
      },
      pageName: {
        title: t(messages.pageName),
        description: t(messages.pageNameHelp),
        type: 'string',
      },
    },
    required: [],
  };
};
