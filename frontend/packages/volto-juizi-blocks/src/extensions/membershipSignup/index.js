/**
 * Juizi additions to the membership sign-up block
 * (volto-collective-membership), which has no dependency on this add-on: it
 * looks up this utility at render time and works without it. See README.md.
 */
import schemaEnhancer from './schema';
import Frame from './Frame';
import './style.css';

export default function installMembershipSignupExtension(config) {
  config.registerUtility({
    type: 'blockExtension',
    name: 'membershipSignup',
    method: () => ({ schemaEnhancer, Frame }),
  });
  return config;
}
