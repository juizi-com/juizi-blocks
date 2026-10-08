import React from 'react';
import { render } from '@testing-library/react';
import installDonationExtension from './index';
import schemaEnhancer from './schema';
import Frame, { formColorVars } from './Frame';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const baseSchema = () => ({
  fieldsets: [
    { id: 'default', fields: ['layout'] },
    { id: 'payment', fields: ['provider_id'] },
  ],
  properties: { layout: {} },
});

describe('donation block extension', () => {
  it('registers the utility the donation block looks up', () => {
    const config = { registerUtility: jest.fn() };
    installDonationExtension(config);
    const [{ type, name, method }] = config.registerUtility.mock.calls[0];
    expect([type, name]).toEqual(['blockExtension', 'donationBlock']);
    expect(Object.keys(method())).toEqual(['schemaEnhancer', 'Frame']);
  });

  it('adds the Background panel after the layout panel', () => {
    const schema = schemaEnhancer({ schema: baseSchema() });
    expect(schema.fieldsets.map((f) => f.id)).toEqual([
      'default',
      'juizi_background',
      'juizi_form_colours',
      'payment',
    ]);
    expect(schema.fieldsets[1].fields).toEqual([
      'backgroundColor',
      'backgroundImage',
    ]);
    expect(schema.properties.layout).toEqual({});
  });

  it('goes after the side text panel, with image options once set', () => {
    const base = baseSchema();
    base.fieldsets.splice(1, 0, { id: 'side_text', fields: [] });
    const schema = schemaEnhancer({
      schema: base,
      formData: { backgroundImage: [{ '@id': '/pattern' }] },
    });
    expect(schema.fieldsets[2].id).toBe('juizi_background');
    expect(schema.fieldsets[2].fields).toContain('backgroundOverlay');
  });

  it('leaves the block untouched without a background', () => {
    const { container } = render(
      <Frame data={{}}>
        <p>form</p>
      </Frame>,
    );
    expect(container.innerHTML).toBe('<p>form</p>');
  });

  it('draws the colour and a decorative image layer', () => {
    const { container } = render(
      <Frame
        data={{
          backgroundColor: '#023e8a',
          backgroundImage: [{ '@id': '/pattern' }],
          backgroundOverlay: 'none',
        }}
      >
        <p>form</p>
      </Frame>,
    );
    const frame = container.firstChild;
    expect(frame).toHaveClass('juizi-donation-frame', 'tone-light');
    expect(frame.style.backgroundColor).toBe('rgb(2, 62, 138)');
    const bg = frame.querySelector('.juizi-donation-frame__bg');
    expect(bg).toHaveAttribute('aria-hidden', 'true');
    expect(bg.style.backgroundImage).toBe('url(/pattern/@@images/image)');
    expect(frame.querySelector('.juizi-donation-frame__overlay')).toBeNull();
  });

  it('keeps the site look until a form colour is chosen', () => {
    expect(formColorVars({})).toEqual({});
    const { container } = render(
      <Frame data={{ highlightColor: '#c8102e' }}>
        <p>form</p>
      </Frame>,
    );
    const frame = container.firstChild;
    expect(frame).toHaveClass('juizi-donation-frame');
    // Colours only: not full width
    expect(frame).not.toHaveClass('juizi-donation-frame--has-bg');
    expect(frame.style.getPropertyValue('--donation-highlight')).toBe(
      '#c8102e',
    );
  });

  it('turns button styles into the button properties', () => {
    const solid = formColorVars({ nextButtonStyle: 'solid__c8102e' });
    expect(solid['--donation-next-background']).toBe('#c8102e');
    expect(solid['--donation-next-border']).toBe('#c8102e');
    const outline = formColorVars({ backButtonStyle: 'outline__c8102e' });
    expect(outline['--donation-back-background']).toBe('transparent');
    expect(outline['--donation-back-foreground']).toBe('#c8102e');
    expect(outline['--donation-back-hover-background']).toBe('#c8102e');
  });
});
