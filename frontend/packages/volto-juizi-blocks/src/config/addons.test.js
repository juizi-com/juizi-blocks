import juiziAddons, { ADDON_ID } from './addons';
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
});
