/**
 * Backward compatibility for content saved by earlier Juizi block add-ons.
 * Registered as a Volto content transform: it runs on every content load
 * (view and edit), converting legacy blocks in memory. See blocks.js.
 * Only once juizi.blocks is installed on the site (settings/runtime.ts).
 */
import { convertLegacyBlock, repairCurrentBlock } from './blocks';
import { isInstalled } from '../settings/runtime';

/** Every blocks container in the content, including nested ones (grids). */
function* blockContainers(node) {
  if (node?.blocks && typeof node.blocks === 'object') {
    yield node.blocks;
    for (const block of Object.values(node.blocks)) {
      yield* blockContainers(block);
    }
  }
}

export function migrateLegacyBlocks(content) {
  // Content is left as saved until juizi.blocks is installed on the site.
  if (!content || !isInstalled()) return content;
  for (const blocks of blockContainers(content)) {
    Object.keys(blocks).forEach((id) => {
      const block = blocks[id];
      if (!block || typeof block !== 'object') return;
      const next = repairCurrentBlock(convertLegacyBlock(block));
      if (next !== block) blocks[id] = next;
    });
  }
  return content;
}

export default function installLegacy(config) {
  config.registerUtility({
    name: 'juiziLegacyBlocks',
    type: 'transform',
    dependencies: { reducer: 'content' },
    method: migrateLegacyBlocks,
  });
  return config;
}
