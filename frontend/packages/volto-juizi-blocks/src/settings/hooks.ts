import { useSelector } from 'react-redux';
import { DEFAULT_SETTINGS } from './constants';
import type { JuiziBlocksSettingsState } from './reducer';
import type { JuiziBlocksSettings } from './types';

export function useJuiziBlocksSettingsState(): JuiziBlocksSettingsState {
  return useSelector((state: any) => state.juiziBlocksSettings);
}

export function useJuiziBlocksSettings(): JuiziBlocksSettings {
  return useSelector(
    (state: any) => state.juiziBlocksSettings?.data ?? DEFAULT_SETTINGS,
  );
}
