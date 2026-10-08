/**
 * Juizi additions to the donation block (volto-donations-block), which has
 * no dependency on this add-on: it looks up this utility at render time and
 * works without it. See README.md.
 */
import schemaEnhancer from './schema';
import Frame from './Frame';
import './style.css';

export default function installDonationExtension(config) {
  config.registerUtility({
    type: 'blockExtension',
    name: 'donationBlock',
    method: () => ({ schemaEnhancer, Frame }),
  });
  return config;
}
