import {
  DEFAULT_SETTINGS,
  GET_JUIZI_BLOCKS_SETTINGS,
  UPDATE_JUIZI_BLOCKS_SETTINGS,
} from './constants';
import type { JuiziBlocksSettings } from './types';

type RequestState = {
  loading: boolean;
  loaded: boolean;
  error: unknown;
};

export type JuiziBlocksSettingsState = {
  data: JuiziBlocksSettings;
  get: RequestState;
  update: RequestState;
};

const idle: RequestState = { loading: false, loaded: false, error: null };

const initialState: JuiziBlocksSettingsState = {
  data: DEFAULT_SETTINGS,
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
          color_config:
            action.result?.color_config ?? DEFAULT_SETTINGS.color_config,
        },
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
        [requestKey(action.type)]: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}
