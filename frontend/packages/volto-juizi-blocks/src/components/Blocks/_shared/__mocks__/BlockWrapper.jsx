/**
 * Manual Jest mock for _shared/BlockWrapper: @kitconcept/volto-bm3-compat
 * ships TypeScript source that Volto's Jest setup doesn't transpile. Mirrors
 * the package's block model 2 markup: `<div class="block {@type}
 * {className}">`. Use with `jest.mock('../_shared/BlockWrapper')`.
 */
import React from 'react';

const BlockWrapper = ({ data, className, style, children }) => (
  <div
    className={['block', data?.['@type'], className].filter(Boolean).join(' ')}
    style={style}
  >
    {children}
  </div>
);

export default BlockWrapper;
