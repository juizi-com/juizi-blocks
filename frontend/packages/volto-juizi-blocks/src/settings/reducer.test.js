import reducer from './reducer';
import {
  DEFAULT_SETTINGS,
  GET_JUIZI_BLOCKS_SETTINGS,
  UPDATE_JUIZI_BLOCKS_SETTINGS,
} from './constants';

describe('juiziBlocksSettings reducer', () => {
  it('starts from the default settings', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.data).toEqual(DEFAULT_SETTINGS);
    expect(state.get.loaded).toBe(false);
  });

  it('stores fetched settings', () => {
    const result = {
      disabled_blocks: ['juiziCallout'],
      enabled_blocks: ['hero'],
      block_groups: { teaser: ['editors'] },
      color_config: { palette: [], blocks: {} },
    };
    const state = reducer(undefined, {
      type: `${GET_JUIZI_BLOCKS_SETTINGS}_SUCCESS`,
      result,
    });
    expect(state.data).toEqual(result);
    expect(state.get.loaded).toBe(true);
    expect(state.update.loaded).toBe(false);
  });

  it('tracks update requests separately', () => {
    let state = reducer(undefined, {
      type: `${UPDATE_JUIZI_BLOCKS_SETTINGS}_PENDING`,
    });
    expect(state.update.loading).toBe(true);
    expect(state.get.loading).toBe(false);
    state = reducer(state, {
      type: `${UPDATE_JUIZI_BLOCKS_SETTINGS}_FAIL`,
      error: 'nope',
    });
    expect(state.update).toEqual({
      loading: false,
      loaded: false,
      error: 'nope',
    });
    // A failed save keeps the previous data.
    expect(state.data).toEqual(DEFAULT_SETTINGS);
  });

  it('knows the add-on is installed once the settings load', () => {
    expect(reducer(undefined, { type: '@@INIT' }).installed).toBe(null);
    const state = reducer(undefined, {
      type: `${GET_JUIZI_BLOCKS_SETTINGS}_SUCCESS`,
      result: {},
    });
    expect(state.installed).toBe(true);
  });

  it('knows the add-on is not installed when the service is missing', () => {
    const state = reducer(undefined, {
      type: `${GET_JUIZI_BLOCKS_SETTINGS}_FAIL`,
      error: { status: 404 },
    });
    expect(state.installed).toBe(false);
  });

  it('stays unsure after other errors', () => {
    const state = reducer(undefined, {
      type: `${GET_JUIZI_BLOCKS_SETTINGS}_FAIL`,
      error: { status: 500 },
    });
    expect(state.installed).toBe(null);
  });

  it('loads the settings again after an add-on is installed', () => {
    let state = reducer(undefined, {
      type: `${GET_JUIZI_BLOCKS_SETTINGS}_FAIL`,
      error: { status: 404 },
    });
    state = reducer(state, { type: 'INSTALL_ADDON_SUCCESS' });
    expect(state.get).toEqual({ loading: false, loaded: false, error: null });
  });
});
