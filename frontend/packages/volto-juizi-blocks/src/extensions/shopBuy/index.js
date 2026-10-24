/**
 * Juizi additions to collective.shop's Buy block and shop pages, which have
 * no dependency on this add-on: the shop looks up this utility at render
 * time and works without it. See README.md.
 */
import schemaEnhancer from './schema';
import Frame, { shopVars as vars } from './Frame';
import './style.css';

export default function installShopExtension(config) {
  config.registerUtility({
    type: 'blockExtension',
    name: 'shopBuy',
    method: () => ({ schemaEnhancer, Frame, vars }),
  });
  return config;
}
