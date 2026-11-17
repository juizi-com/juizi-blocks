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
 *
 * A site may also hide juizi.blocks once installed, when another add-on
 * installs and upgrades it (plone.org's ploneorg does). Missing from the list
 * is then no sign it isn't installed, and installing it again would reset its
 * settings. The settings service is: it answers once juizi.blocks is
 * installed and is a 404 before. So the entry is offered only while the
 * settings haven't loaded, taken away when they do, and offered again when
 * they turn out to be missing, whichever of the two requests answers first.
 * The settings' verdict is kept in this reducer's state (`juiziBlocks`).
 *
 * Other add-ons offer theirs the same way (the collective payments and form
 * add-ons, juizi.dashboard, members-only), so settings.ts wraps whichever
 * add-ons reducer is already configured (withJuiziAddons) instead of
 * replacing it: replacing it would drop the add-ons offered by the ones
 * loaded earlier.
 */
import addons from '@plone/volto/reducers/addons/addons';
import { LIST_ADDONS } from '@plone/volto/constants/ActionTypes';
import {
  GET_JUIZI_BLOCKS_SETTINGS,
  UPDATE_JUIZI_BLOCKS_SETTINGS,
} from '../settings/constants';
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

/** What the settings service last said: true once the settings load, false
 * when it is a 404 (not installed), null until either. */
type Installed = boolean | null;

/** The settings' verdict on juizi.blocks after this action, or `known`. */
export function installedAfter(known: Installed, action: any = {}): Installed {
  switch (action.type) {
    case `${GET_JUIZI_BLOCKS_SETTINGS}_SUCCESS`:
    case `${UPDATE_JUIZI_BLOCKS_SETTINGS}_SUCCESS`:
      return true;
    case `${GET_JUIZI_BLOCKS_SETTINGS}_FAIL`:
      return action.error?.status === 404 ? false : known;
    default:
      return known;
  }
}

/** The action, with juizi.blocks added to the backend's list if missing.
 * Not when the settings say it is installed: the site hides it on purpose. */
export function withJuiziBlocks(action: any = {}, installed: Installed = null) {
  const items = action.result?.items;
  if (
    installed !== true &&
    action.type === `${LIST_ADDONS}_SUCCESS` &&
    Array.isArray(items) &&
    !items.some((item: any) => item?.id === ADDON_ID)
  ) {
    return {
      ...action,
      result: { ...action.result, items: [...items, JUIZI_BLOCKS_ADDON] },
    };
  }
  return action;
}

const listed = (state: any) =>
  [...(state?.installedAddons || []), ...(state?.availableAddons || [])].some(
    (item: any) => item?.id === ADDON_ID,
  );

/** The list once the settings answer after it: the entry offered here is
 * taken away when they load, and offered when they are missing. */
function reconcile(state: any, installed: Installed) {
  const available = state?.availableAddons || [];
  if (installed === true && available.includes(JUIZI_BLOCKS_ADDON)) {
    return {
      ...state,
      availableAddons: available.filter(
        (item: any) => item !== JUIZI_BLOCKS_ADDON,
      ),
    };
  }
  if (installed === false && state?.loaded && !listed(state)) {
    return { ...state, availableAddons: [...available, JUIZI_BLOCKS_ADDON] };
  }
  return state;
}

/** Wraps the add-ons reducer that was configured before this add-on. */
export function withJuiziAddons(previous: any = addons) {
  return (state: any, action: any = {}) => {
    const known: Installed = state?.juiziBlocks ?? null;
    const installed = installedAfter(known, action);
    const next = previous(state, withJuiziBlocks(action, installed));
    if (installed === known && next?.juiziBlocks === known) return next;
    return reconcile({ ...next, juiziBlocks: installed }, installed);
  };
}

export default withJuiziAddons(addons);
