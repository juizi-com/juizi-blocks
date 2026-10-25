/**
 * Juizi additions to collective.donations' donation block, which has
 * no dependency on this add-on: it looks up this utility at render time and
 * works without it. See README.md.
 */
import schemaEnhancer from './schema';
import Frame from './Frame';
import { JUIZI_GROUP, joinJuiziGroup } from '../_shared/group';
import './style.css';

export default function installDonationExtension(config) {
  config.registerUtility({
    type: 'blockExtension',
    name: 'donationBlock',
    method: () => ({ schemaEnhancer, Frame, group: JUIZI_GROUP }),
  });
  joinJuiziGroup(config, 'donationBlock');
  return config;
}
