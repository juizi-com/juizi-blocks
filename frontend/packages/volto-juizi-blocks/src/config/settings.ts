import type { ConfigType } from '@plone/registry';
import juiziBlocksSettings from '../settings/reducer';
import {
  DEFAULT_SETTINGS,
  getJuiziBlocksSettings,
  GET_JUIZI_BLOCKS_SETTINGS,
  setRuntimeSettings,
} from '../settings';
import SettingsLoader from '../components/SettingsLoader';
import Dashboard from '../components/Dashboard/Dashboard';
import paletteSVG from '@plone/volto/icons/paint.svg';
import voltoLanguages from '@plone/volto/constants/Languages.cjs';

export const CONTROLPANEL_ID = 'juizi-blocks';

/**
 * Interface languages this add-on is translated into that Volto doesn't list
 * yet. Volto only renders in a language from its own list (the server falls
 * back to English for any other), so a site whose language is Afrikaans
 * would get these blocks in English. Listing the language here lets such a
 * site use it; it also appears in the personal preferences language choice.
 * Remove an entry once Volto lists the language itself.
 */
const EXTRA_LANGUAGES: Record<string, string> = { af: 'Afrikaans' };

export default function install(config: ConfigType) {
  // Runs before Volto's server reads its language list.
  Object.entries(EXTRA_LANGUAGES).forEach(([code, name]) => {
    if (!voltoLanguages[code]) voltoLanguages[code] = name;
  });

  // Settings store
  config.addonReducers = {
    ...config.addonReducers,
    juiziBlocksSettings,
  };

  // Fetch the settings during SSR and apply them before rendering, so
  // colours, themes and schemas match the saved settings in the first
  // response (see settings/runtime.ts).
  config.settings.asyncPropsExtenders = [
    ...(config.settings.asyncPropsExtenders || []),
    {
      path: '/',
      extend: (dispatchActions: any[]) => {
        if (
          !dispatchActions.some(
            (action) => action.key === GET_JUIZI_BLOCKS_SETTINGS,
          )
        ) {
          dispatchActions.push({
            key: GET_JUIZI_BLOCKS_SETTINGS,
            // Never fail the whole page render because of this request.
            promise: ({ store: { dispatch } }: any) =>
              __SERVER__ &&
              dispatch(getJuiziBlocksSettings())
                .then((result: any) => setRuntimeSettings(result))
                .catch(() => null),
          });
        }
        return dispatchActions;
      },
    },
  ];

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    { match: '', component: SettingsLoader, props: {} },
  ];

  // Dashboard
  config.addonRoutes = [
    ...(config.addonRoutes || []),
    { path: `/controlpanel/${CONTROLPANEL_ID}`, component: Dashboard },
  ];
  config.settings.controlpanels = [
    ...(config.settings.controlpanels || []),
    {
      '@id': `/${CONTROLPANEL_ID}`,
      group: 'Add-on Configuration',
      title: 'Juizi Blocks',
    },
  ];
  config.settings.controlPanelsIcons = {
    ...config.settings.controlPanelsIcons,
    [CONTROLPANEL_ID]: paletteSVG as any,
  };

  return config;
}

/** Applies the settings the app starts with. Call after the blocks are
 * registered. In the browser that is the state the server rendered with. */
export function applyInitialSettings() {
  setRuntimeSettings(DEFAULT_SETTINGS);
  if (typeof window !== 'undefined') {
    setRuntimeSettings((window as any).__data?.juiziBlocksSettings?.data);
  }
}
