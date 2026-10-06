import type { ConfigType } from '@plone/registry';
import juiziBlocksSettings from '../settings/reducer';
import juiziAddons from './addons';
import {
  CONTROLPANEL_ID,
  getJuiziBlocksSettings,
  GET_JUIZI_BLOCKS_SETTINGS,
  setInstalled,
  setRuntimeSettings,
} from '../settings';
import SettingsLoader from '../components/SettingsLoader';
import Dashboard from '../components/Dashboard/Dashboard';
import paletteSVG from '@plone/volto/icons/paint.svg';
import voltoLanguages from '@plone/volto/constants/Languages.cjs';

export { CONTROLPANEL_ID };

/**
 * The settings request of one SSR render. It also says whether juizi.blocks
 * is installed, which the content transforms need (see legacy/), so the
 * content request waits for it. Keyed by the request's store.
 */
const settingsRequests = new WeakMap<object, Promise<unknown>>();

function loadSettings(store: any) {
  if (!settingsRequests.has(store)) {
    settingsRequests.set(
      store,
      store
        .dispatch(getJuiziBlocksSettings())
        .then((result: any) => {
          setInstalled(true);
          setRuntimeSettings(result);
        })
        // Not installed (404) or unavailable: the add-on stays inactive.
        // Never fail the whole page render because of this request.
        .catch(() => setInstalled(false)),
    );
  }
  return settingsRequests.get(store);
}

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

  // Settings store, and Site Setup → Add-ons offering juizi.blocks
  // (config/addons.ts).
  config.addonReducers = {
    ...config.addonReducers,
    juiziBlocksSettings,
    addons: juiziAddons,
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
          dispatchActions.some(
            (action) => action.key === GET_JUIZI_BLOCKS_SETTINGS,
          )
        ) {
          return dispatchActions;
        }
        return [
          ...dispatchActions.map((action) =>
            action.key === 'content'
              ? {
                  ...action,
                  promise: (args: any) =>
                    __SERVER__
                      ? loadSettings(args.store).then(() =>
                          action.promise(args),
                        )
                      : action.promise(args),
                }
              : action,
          ),
          {
            key: GET_JUIZI_BLOCKS_SETTINGS,
            promise: ({ store }: any) => __SERVER__ && loadSettings(store),
          },
        ];
      },
    },
  ];

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    { match: '', component: SettingsLoader, props: {} },
  ];

  // Dashboard. Listed in Site Setup once the add-on is installed
  // (settings/runtime.ts, setInstalled).
  config.addonRoutes = [
    ...(config.addonRoutes || []),
    { path: `/controlpanel/${CONTROLPANEL_ID}`, component: Dashboard },
  ];
  config.settings.controlPanelsIcons = {
    ...config.settings.controlPanelsIcons,
    [CONTROLPANEL_ID]: paletteSVG as any,
  };

  return config;
}

/** Applies the settings the app starts with. Call after the blocks are
 * registered. In the browser that is the state the server rendered with;
 * otherwise the add-on starts inactive until the backend says it is
 * installed. */
export function applyInitialSettings() {
  const state =
    typeof window !== 'undefined'
      ? (window as any).__data?.juiziBlocksSettings
      : undefined;
  setInstalled(state?.installed === true);
  if (state?.installed === true) setRuntimeSettings(state.data);
}
