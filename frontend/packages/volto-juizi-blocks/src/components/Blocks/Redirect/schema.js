import { schemaData } from '../../BlockEdit/BlockEdit';
import { getRedirectUrl } from './redirectTarget';

// Called as ({ intl, props, data, formData }) by makeBlockEdit.
// `url` keeps the field name saved redirects already use. The page name is
// offered once there's a destination to name.
export const redirectSchema = (args = {}) => {
  const data = schemaData(args);
  return {
    title: 'Redirect',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['url', ...(getRedirectUrl(data) ? ['pageName'] : [])],
      },
    ],
    properties: {
      url: {
        title: 'Send visitors to',
        description:
          "Choose a page on this site, or type a web address. Visitors see this page for a few seconds, then move on. You and other editors aren't redirected.",
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        multi: false,
      },
      pageName: {
        title: 'Page name',
        description:
          "Shown instead of the web address, e.g. 'Our new events page'. Leave empty to show the address.",
        type: 'string',
      },
    },
    required: [],
  };
};
