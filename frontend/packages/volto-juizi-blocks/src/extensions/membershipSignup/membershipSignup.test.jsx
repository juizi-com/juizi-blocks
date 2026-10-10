import React from 'react';
import { render } from '@testing-library/react';
import installMembershipSignupExtension from './index';
import schemaEnhancer from './schema';
import Frame, { formColorVars } from './Frame';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const baseSchema = () => ({
  fieldsets: [
    { id: 'default', fields: ['mode', 'layout'] },
    { id: 'side_text', fields: ['side_heading'] },
  ],
  properties: { mode: {} },
});

describe('membership sign-up block extension', () => {
  it('registers the utility the sign-up block looks up', () => {
    const config = { registerUtility: jest.fn() };
    installMembershipSignupExtension(config);
    const [{ type, name, method }] = config.registerUtility.mock.calls[0];
    expect([type, name]).toEqual(['blockExtension', 'membershipSignup']);
    expect(Object.keys(method())).toEqual(['schemaEnhancer', 'Frame']);
  });

  it('adds Background and Form colours after the side text', () => {
    const schema = schemaEnhancer({ schema: baseSchema() });
    expect(schema.fieldsets.map((f) => f.id)).toEqual([
      'default',
      'side_text',
      'juizi_background',
      'juizi_form_colours',
    ]);
    expect(schema.fieldsets[3].fields).toEqual([
      'highlightColor',
      'mainButtonStyle',
    ]);
    expect(schema.properties.mode).toEqual({});
  });

  it('leaves the block untouched with nothing chosen', () => {
    const { container } = render(
      <Frame data={{}}>
        <p>form</p>
      </Frame>,
    );
    expect(container.innerHTML).toBe('<p>form</p>');
  });

  it('draws a background, and sets the form colours', () => {
    const { container } = render(
      <Frame data={{ backgroundColor: '#023e8a', highlightColor: '#c8102e' }}>
        <p>form</p>
      </Frame>,
    );
    const frame = container.firstChild;
    expect(frame).toHaveClass(
      'juizi-membership-frame',
      'juizi-membership-frame--has-bg',
      'tone-light',
    );
    expect(frame.style.getPropertyValue('--membership-highlight')).toBe(
      '#c8102e',
    );
  });

  it('turns the button style into the button properties', () => {
    const solid = formColorVars({ mainButtonStyle: 'solid__c8102e' });
    expect(solid['--membership-button-background']).toBe('#c8102e');
    const outline = formColorVars({ mainButtonStyle: 'outline__c8102e' });
    expect(outline['--membership-button-background']).toBe('transparent');
    expect(outline['--membership-button-hover-background']).toBe('#c8102e');
  });
});
