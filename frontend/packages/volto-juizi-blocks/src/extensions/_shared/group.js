/**
 * The donation, membership sign-up and Buy blocks sit with the Juizi blocks
 * in the block chooser. Each of those add-ons reads `group` from its block
 * extension when it registers its block after this add-on; when it loaded
 * first, its block is moved here.
 */
import { JUIZI_GROUP } from '../../config/group';

export { JUIZI_GROUP };

export function joinJuiziGroup(config, blockId) {
  const block = config.blocks?.blocksConfig?.[blockId];
  if (block) {
    block.group = JUIZI_GROUP;
  }
}
