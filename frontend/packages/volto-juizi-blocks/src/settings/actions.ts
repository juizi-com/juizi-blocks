import {
  GET_JUIZI_BLOCKS_SETTINGS,
  SETTINGS_ENDPOINT,
  UPDATE_JUIZI_BLOCKS_SETTINGS,
} from './constants';
import type { JuiziBlocksSettings } from './types';

export function getJuiziBlocksSettings() {
  return {
    type: GET_JUIZI_BLOCKS_SETTINGS,
    request: {
      op: 'get',
      path: SETTINGS_ENDPOINT,
    },
  };
}

export function updateJuiziBlocksSettings(data: Partial<JuiziBlocksSettings>) {
  return {
    type: UPDATE_JUIZI_BLOCKS_SETTINGS,
    request: {
      op: 'patch',
      path: SETTINGS_ENDPOINT,
      data,
    },
  };
}
