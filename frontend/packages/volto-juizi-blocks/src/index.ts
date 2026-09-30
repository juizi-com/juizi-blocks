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

export default applyConfig;
