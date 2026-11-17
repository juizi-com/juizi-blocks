import addons from '@plone/volto/reducers/addons/addons';
import juiziAddons, { ADDON_ID, withJuiziAddons } from './addons';
import packageJson from '../../package.json';

const listed = (items) =>
  juiziAddons(undefined, {
    type: 'LIST_ADDONS_SUCCESS',
    result: { items },
  });

const plain = {
  id: 'plone.app.caching',
  title: 'HTTP caching support',
  is_installed: true,
  upgrade_info: {},
};

describe('Site Setup → Add-ons on a frontend with volto-juizi-blocks', () => {
  it('offers juizi.blocks while the backend leaves it out', () => {
    const state = listed([plain]);
    expect(state.availableAddons.map((a) => a.id)).toEqual([ADDON_ID]);
    expect(state.availableAddons[0].version).toBe(packageJson.version);
    expect(state.installedAddons.map((a) => a.id)).toEqual([
      'plone.app.caching',
    ]);
  });

  it('adds nothing once the backend lists it', () => {
    const state = listed([
      plain,
      {
        id: ADDON_ID,
        title: 'Juizi Blocks',
        is_installed: true,
        upgrade_info: {},
      },
    ]);
    expect(state.availableAddons).toEqual([]);
    expect(state.installedAddons.map((a) => a.id)).toEqual([
      'plone.app.caching',
      ADDON_ID,
    ]);
  });

  it("leaves Volto's other add-on actions as they are", () => {
    const state = juiziAddons(undefined, { type: 'INSTALL_ADDON_PENDING' });
    expect(state.loading).toBe(true);
  });

  it('keeps the add-ons another add-on offers before it', () => {
    // As another add-on's wrapper would (offerAddon.js in the collective
    // add-ons): it adds its own entry, then hands on to Volto's reducer.
    const other = (state, action) =>
      addons(
        state,
        action.type === 'LIST_ADDONS_SUCCESS'
          ? {
              ...action,
              result: {
                items: [
                  ...action.result.items,
                  {
                    id: 'collective.other',
                    title: 'Other',
                    is_installed: false,
                    upgrade_info: {},
                  },
                ],
              },
            }
          : action,
      );
    const state = withJuiziAddons(other)(undefined, {
      type: 'LIST_ADDONS_SUCCESS',
      result: { items: [plain] },
    });
    expect(state.availableAddons.map((a) => a.id).sort()).toEqual(
      [ADDON_ID, 'collective.other'].sort(),
    );
  });

  describe('on a site that hides juizi.blocks once installed', () => {
    // As plone.org does: ploneorg installs and upgrades juizi.blocks, and
    // leaves it out of the list. The settings service says it is installed.
    const settingsLoaded = {
      type: 'GET_JUIZI_BLOCKS_SETTINGS_SUCCESS',
      result: { color_config: {} },
    };
    const notInstalled = {
      type: 'GET_JUIZI_BLOCKS_SETTINGS_FAIL',
      error: { status: 404 },
    };
    const list = { type: 'LIST_ADDONS_SUCCESS', result: { items: [plain] } };
    const run = (...actions) => actions.reduce(juiziAddons, undefined);
    const offered = (state) =>
      state.availableAddons.some((a) => a.id === ADDON_ID);

    it('offers nothing when the settings load first', () => {
      expect(offered(run(settingsLoaded, list))).toBe(false);
    });

    it('takes the offer back when the settings load after the list', () => {
      expect(offered(run(list))).toBe(true);
      expect(offered(run(list, settingsLoaded))).toBe(false);
    });

    it('still offers it when the settings are missing (404)', () => {
      expect(offered(run(notInstalled, list))).toBe(true);
      expect(offered(run(list, notInstalled))).toBe(true);
      expect(
        run(list, notInstalled).availableAddons.filter(
          (a) => a.id === ADDON_ID,
        ),
      ).toHaveLength(1);
    });

    it('offers it again once it is uninstalled', () => {
      const state = run(settingsLoaded, list, notInstalled);
      expect(offered(state)).toBe(true);
    });

    it('keeps the verdict when the settings fail for another reason', () => {
      const state = run(settingsLoaded, list, {
        type: 'GET_JUIZI_BLOCKS_SETTINGS_FAIL',
        error: { status: 500 },
      });
      expect(offered(state)).toBe(false);
    });

    it('leaves the state alone on unrelated actions', () => {
      const state = run(settingsLoaded, list);
      expect(juiziAddons(state, { type: 'SOMETHING_ELSE' })).toBe(state);
    });
  });
});
