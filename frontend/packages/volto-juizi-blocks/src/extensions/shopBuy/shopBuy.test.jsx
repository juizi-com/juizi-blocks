import React from 'react';
import { render } from '@testing-library/react';
import installShopExtension from './index';
import schemaEnhancer from './schema';
import Frame, { shopVars } from './Frame';
import { getBlockColorList } from '../../config/colors';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const baseSchema = () => ({
  fieldsets: [{ id: 'default', fields: ['source', 'button_text'] }],
  properties: { source: {} },
});

describe('shop extension', () => {
  it('registers the utility collective.shop looks up', () => {
    const config = { registerUtility: jest.fn(), blocks: { blocksConfig: {} } };
    installShopExtension(config);
    const [{ type, name, method }] = config.registerUtility.mock.calls[0];
    expect([type, name]).toEqual(['blockExtension', 'shopBuy']);
    expect(Object.keys(method())).toEqual([
      'schemaEnhancer',
      'Frame',
      'vars',
      'group',
    ]);
    // The shop loads later: it reads the group from the utility.
    expect(method().group).toBe('juizi');
    expect(config.blocks.blocksConfig.shopBuy).toBeUndefined();
  });

  it('moves the Buy button into the Juizi group when the shop loaded first', () => {
    const config = {
      registerUtility: jest.fn(),
      blocks: { blocksConfig: { shopBuy: { id: 'shopBuy', group: 'common' } } },
    };
    installShopExtension(config);
    expect(config.blocks.blocksConfig.shopBuy.group).toBe('juizi');
  });

  it('adds Background & spacing and Button colours after what it sells', () => {
    const schema = schemaEnhancer({ schema: baseSchema() });
    expect(schema.fieldsets.map((f) => f.id)).toEqual([
      'default',
      'juizi_background',
      'juizi_shop_colours',
    ]);
    expect(schema.fieldsets[2].fields).toEqual([
      'mainButtonStyle',
      'secondButtonStyle',
      'highlightColor',
    ]);
    expect(schema.properties.source).toEqual({});
  });

  it('leaves the block untouched without a background or padding', () => {
    const { container } = render(
      <Frame data={{ mainButtonStyle: 'solid__c8102e' }}>
        <p>buy</p>
      </Frame>,
    );
    expect(container.innerHTML).toBe('<p>buy</p>');
  });

  it('draws the background frame', () => {
    const { container } = render(
      <Frame data={{ backgroundColor: '#023e8a' }}>
        <p>buy</p>
      </Frame>,
    );
    expect(container.firstChild).toHaveClass(
      'juizi-shop-frame',
      'juizi-shop-frame--has-bg',
      'tone-light',
    );
  });

  it('gives the site buttons by default: solid main, outlined Buy now', () => {
    const vars = shopVars();
    expect(vars['--shop-button-radius']).toBe(
      'var(--juizi-button-radius, 4px)',
    );
    expect(getBlockColorList('shopBuy').length).toBeGreaterThan(0);
    expect(vars['--shop-main-background']).toBe(vars['--shop-accent']);
    expect(vars['--shop-second-background']).toBe('transparent');
    expect(vars['--shop-second-foreground']).toBe(vars['--shop-accent']);
  });

  it('uses the block’s choices over the site’s', () => {
    const vars = shopVars({
      mainButtonStyle: 'outline__c8102e',
      highlightColor: '#c8102e',
    });
    expect(vars['--shop-main-background']).toBe('transparent');
    expect(vars['--shop-main-border']).toBe('#c8102e');
    expect(vars['--shop-accent']).toBe('#c8102e');
  });
});
