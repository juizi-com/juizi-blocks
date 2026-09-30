import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';
import installSettings, { applyInitialSettings } from './config/settings';
import installBlocks from './config/blocks';
import installLegacy from './legacy';

import './theme/juizi-blocks.scss';
import './config/buttons.scss';
// After the blocks' own stylesheets, so the shared rules take precedence.
import './theme/juizi-common.scss';

// Re-exported for code that used the previous add-on's API.
export {
  MASTER_COLOR_LIST,
  getColorChoices,
  isColorDark,
  getBlockColorList,
} from './config/colors';

declare module '@plone/types' {
  export interface BlocksConfigData {
    juiziHero: BlockConfigBase;
    contentRow: BlockConfigBase;
    emblaCarousel: BlockConfigBase;
    emblaGallery: BlockConfigBase;
    redirectBlock: BlockConfigBase;
    juiziCallout: BlockConfigBase;
  }
}

function applyConfig(config: ConfigType) {
  installSettings(config);
  installBlocks(config);
  // Converts blocks saved by earlier Juizi add-ons as content loads.
  installLegacy(config);
  applyInitialSettings();
  return config;
}

/**
 * Optional extra configuration: a multilingual site in every language the
 * add-on is translated into. It matches the demo content the backend's
 * example profile creates (one block showcase page per language) and is what
 * this repository's own development site uses:
 *
 *   // volto.config.js
 *   const addons = ['volto-juizi-blocks:languageDemo'];
 *
 * A real site sets its languages in its own configuration instead: the
 * add-on's default configuration never touches them.
 */
export const LANGUAGE_DEMO_LANGUAGES = ['en', 'fr', 'pt', 'pt-br', 'es', 'af'];

export function languageDemo(config: ConfigType) {
  config.settings.isMultilingual = true;
  config.settings.supportedLanguages = LANGUAGE_DEMO_LANGUAGES;
  config.settings.defaultLanguage = LANGUAGE_DEMO_LANGUAGES[0];
  return config;
}

export default applyConfig;
