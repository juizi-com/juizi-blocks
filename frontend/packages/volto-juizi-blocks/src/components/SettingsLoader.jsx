/**
 * App extra that keeps the Juizi Blocks settings in effect site-wide:
 * - outputs the master colours as `:root` CSS variables (`--green`,
 *   `--green-rgb`, `--green-foreground`, ...), so blocks that stored
 *   `var(--green)` follow dashboard changes;
 * - re-applies the settings to the running app when they change.
 *
 * The settings are fetched during SSR by an asyncPropsExtender (see
 * config/settings.ts), so the colours are in the first HTML response.
 */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  buildColorCss,
  getJuiziBlocksSettings,
  setRuntimeSettings,
  useJuiziBlocksSettings,
  useJuiziBlocksSettingsState,
} from '../settings';

const SettingsLoader = () => {
  const dispatch = useDispatch();
  const settings = useJuiziBlocksSettings();
  const state = useJuiziBlocksSettingsState();
  const { loaded, loading, error } = state?.get || {};

  useEffect(() => {
    if (!loaded && !loading && !error) {
      dispatch(getJuiziBlocksSettings());
    }
  }, [dispatch, loaded, loading, error]);

  useEffect(() => {
    setRuntimeSettings(settings);
  }, [settings]);

  return (
    <style
      data-juizi-blocks-colors=""
      // Names and values are validated in buildColorCss and in the backend.
      dangerouslySetInnerHTML={{ __html: buildColorCss(settings.color_config) }}
    />
  );
};

export default SettingsLoader;
