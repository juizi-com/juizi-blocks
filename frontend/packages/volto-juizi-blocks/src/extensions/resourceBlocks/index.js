/**
 * Juizi styling for the blocks of collective.resourcelibrary, which has no
 * dependency on this add-on: each block looks up its utility at render time
 * and works without it. The blocks stay in the add-on's own Resource group,
 * so this doesn't join them to the Juizi group. See README.md.
 */
import { isInstalled } from '../../settings/runtime';
import { RESOURCE_BLOCK_IDS, makeSchemaEnhancer } from './schema';
import Frames from './Frame';
import './style.css';

export default function installResourceBlocksExtension(config) {
  RESOURCE_BLOCK_IDS.forEach((name) => {
    const schemaEnhancer = makeSchemaEnhancer(name);
    config.registerUtility({
      type: 'blockExtension',
      name,
      // Nothing until juizi.blocks is installed on the site, as for the
      // Juizi blocks: the add-on can be deployed before that.
      method: () =>
        isInstalled() ? { schemaEnhancer, Frame: Frames[name] } : {},
    });
  });
  return config;
}
