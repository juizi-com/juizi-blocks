import {
  DEFAULT_SETTINGS,
  GET_JUIZI_BLOCKS_SETTINGS,
  UPDATE_JUIZI_BLOCKS_SETTINGS,
} from './constants';
import type { JuiziBlocksSettings } from './types';

// Volto's add-ons control panel.
const INSTALL_ADDON = 'INSTALL_ADDON';
const UNINSTALL_ADDON = 'UNINSTALL_ADDON';

type RequestState = {
  loading: boolean;
  loaded: boolean;
  error: unknown;
};

export type JuiziBlocksSettingsState = {
  data: JuiziBlocksSettings;
  /** Whether juizi.blocks is installed on the site: true once the settings
   * load, false when the backend has no settings service (404), null until
   * known. */
  installed: boolean | null;
  get: RequestState;
  update: RequestState;
};

const idle: RequestState = { loading: false, loaded: false, error: null };

const initialState: JuiziBlocksSettingsState = {
  data: DEFAULT_SETTINGS,
  installed: null,
  get: idle,
  update: idle,
};

function requestKey(type: string) {
  return type.startsWith(UPDATE_JUIZI_BLOCKS_SETTINGS) ? 'update' : 'get';
}

export default function juiziBlocksSettings(
  state: JuiziBlocksSettingsState = initialState,
  action: { type: string; result?: any; error?: unknown },
): JuiziBlocksSettingsState {
  switch (action.type) {
    case `${GET_JUIZI_BLOCKS_SETTINGS}_PENDING`:
    case `${UPDATE_JUIZI_BLOCKS_SETTINGS}_PENDING`:
      return {
        ...state,
        [requestKey(action.type)]: {
          loading: true,
          loaded: false,
          error: null,
        },
      };
    case `${GET_JUIZI_BLOCKS_SETTINGS}_SUCCESS`:
    case `${UPDATE_JUIZI_BLOCKS_SETTINGS}_SUCCESS`:
      return {
        ...state,
        data: {
          disabled_blocks: action.result?.disabled_blocks ?? [],
          enabled_blocks: action.result?.enabled_blocks ?? [],
          block_groups: action.result?.block_groups ?? {},
          color_config:
            action.result?.color_config ?? DEFAULT_SETTINGS.color_config,
        },
        installed: true,
        [requestKey(action.type)]: {
          loading: false,
          loaded: true,
          error: null,
        },
      };
    case `${GET_JUIZI_BLOCKS_SETTINGS}_FAIL`:
    case `${UPDATE_JUIZI_BLOCKS_SETTINGS}_FAIL`:
      return {
        ...state,
        installed:
          (action.error as any)?.status === 404 &&
          requestKey(action.type) === 'get'
            ? false
            : state.installed,
        [requestKey(action.type)]: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    // Installing or uninstalling an add-on may change whether this one is
    // installed: load the settings again.
    case `${INSTALL_ADDON}_SUCCESS`:
    case `${UNINSTALL_ADDON}_SUCCESS`:
      return { ...state, get: idle };
    default:
      return state;
  }
}
