/**
 * Offers juizi.blocks in Site Setup → Add-ons on this frontend.
 *
 * The backend leaves juizi.blocks out of its add-ons list until it is
 * installed on the site (juizi.blocks setuphandlers.HiddenProfiles): one
 * backend can serve several sites, and only the ones whose frontend includes
 * this add-on can use it. This wraps Volto's add-ons reducer so that, on a
 * frontend with volto-juizi-blocks, the list includes it as an available
 * add-on; Volto's usual Install button then installs it. Once installed, the
 * backend lists it itself and nothing is added.
 */
import addons from '@plone/volto/reducers/addons/addons';
import { LIST_ADDONS } from '@plone/volto/constants/ActionTypes';
import packageJson from '../../package.json';

export const ADDON_ID = 'juizi.blocks';

/** As the backend describes it once listed (juizi.blocks profiles.zcml). */
export const JUIZI_BLOCKS_ADDON = {
  '@id': `/@addons/${ADDON_ID}`,
  id: ADDON_ID,
  title: 'Juizi Blocks',
  description:
    "Juizi's block set (Hero, Content Row, Carousel, Gallery, Callout, Redirect) with a dashboard for colours and block switches. Needs the volto-juizi-blocks frontend add-on.",
  install_profile_id: `${ADDON_ID}:default`,
  is_installed: false,
  profile_type: 'default',
  uninstall_profile_id: '',
  upgrade_info: {},
  // The release this frontend add-on belongs to. The backend package has the
  // same version (versions.test.js), shown once it lists the add-on itself.
  version: packageJson.version,
};

export default function juiziAddons(state: any, action: any = {}) {
  const items = action.result?.items;
  if (
    action.type === `${LIST_ADDONS}_SUCCESS` &&
    Array.isArray(items) &&
    !items.some((item: any) => item?.id === ADDON_ID)
  ) {
    return addons(state, {
      ...action,
      result: { ...action.result, items: [...items, JUIZI_BLOCKS_ADDON] },
    });
  }
  return addons(state, action);
}
