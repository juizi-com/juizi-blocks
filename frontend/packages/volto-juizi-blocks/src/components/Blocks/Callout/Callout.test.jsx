import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IntlProvider } from 'react-intl';
import View from './View';
import callout from './index';
import { calloutSchema } from './schema';
import {
  changeCalloutType,
  getInitialDataForType,
  isCalloutConfigured,
} from './types';
import { setRuntimeSettings } from '../../../settings/runtime';
import { DEFAULT_SETTINGS } from '../../../settings/constants';

// A TS module of Volto core: not needed to test the callout.
jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () =>
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  (props) => <a {...props} />,
);
jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('../_shared/BlockWrapper');

const intl = { formatMessage: (m) => m.defaultMessage };
const renderView = (props) =>
  render(
    <IntlProvider locale="en">
      <View {...props} />
    </IntlProvider>,
  );

describe('Callout initial state', () => {
  it('shows the shared placeholder with the types while editing', () => {
    const { container } = renderView({
      data: { '@type': 'juiziCallout' },
      isEditMode: true,
    });
    expect(container.querySelector('.block-placeholder')).not.toBeNull();
    expect(
      screen.getByText('Select a callout type in the sidebar to get started.'),
    ).toBeTruthy();
    ['Information', 'Tip', 'Warning', 'Success', 'Announcement'].forEach(
      (label) => expect(screen.getByText(label)).toBeTruthy(),
    );
  });

  it('renders nothing on the live site until a type is chosen', () => {
    const { container } = renderView({ data: { '@type': 'juiziCallout' } });
    expect(container.innerHTML).toBe('');
  });

  it('renders the callout once a type is chosen', () => {
    const { container } = renderView({
      data: { '@type': 'juiziCallout', calloutType: 'tip', icon: 'lightbulb' },
      isEditMode: true,
    });
    expect(container.querySelector('.juizi-callout--tip')).not.toBeNull();
    expect(container.querySelector('.block-placeholder')).toBeNull();
  });

  it('keeps callouts created before types existed', () => {
    expect(isCalloutConfigured({ title: 'Hello' })).toBe(true);
    // An icon-only callout (e.g. the one on the demo page) keeps rendering.
    expect(
      isCalloutConfigured({ icon: 'lightbulb', theme: 'faded-blue' }),
    ).toBe(true);
    // A fresh block with only schema defaults (VLT's theme) is not.
    expect(isCalloutConfigured({ theme: 'default', styles: {} })).toBe(false);
    expect(isCalloutConfigured({})).toBe(false);
  });

  it('has no schema defaults that would skip the type choice', () => {
    const { properties } = calloutSchema({ intl, props: { data: {} } });
    Object.values(properties).forEach((field) =>
      expect(field.default).toBeUndefined(),
    );
  });

  it('shows only the type selector until a type is chosen', () => {
    const fieldsets = (data) =>
      calloutSchema({ intl, props: { data } }).fieldsets.map((f) => [
        f.id,
        f.fields,
      ]);
    expect(fieldsets({})).toEqual([['default', ['calloutType']]]);
    // Once chosen, the type stays first (visible and changeable), followed
    // by the icon, content and colours.
    expect(fieldsets({ calloutType: 'info' })).toEqual([
      [
        'default',
        ['calloutType', 'icon', 'title', 'text', 'link', 'linkTitle'],
      ],
      ['colors', ['backgroundColor', 'iconColor', 'linkColor']],
    ]);
  });

  it("offers the block's colours from the shared list", () => {
    const { properties } = calloutSchema({
      intl,
      props: { data: { calloutType: 'info' } },
    });
    // 'None' is a real background choice, so editors can go back to it.
    expect(properties.backgroundColor.choices[0]).toEqual([
      'transparent',
      'None',
    ]);
    expect(properties.backgroundColor.choices[1]).toEqual([
      'var(--white)',
      'White',
    ]);
    expect(properties.linkColor.choices).toEqual(
      properties.backgroundColor.choices.slice(1),
    );
  });

  it('applies the background, its text colour, and the link colour', () => {
    // jsdom rejects var() in colour properties, so check the markup React
    // renders (as on the server) instead of the DOM.
    const html = renderToStaticMarkup(
      <IntlProvider locale="en">
        <View
          data={{
            '@type': 'juiziCallout',
            calloutType: 'tip',
            title: 'Hi',
            link: [{ '@id': '/page' }],
            backgroundColor: 'var(--green)',
            iconColor: 'var(--gold)',
            linkColor: 'var(--fadedgold)',
          }}
        />
      </IntlProvider>,
    );
    expect(html).toContain(
      'class="juizi-block juizi-callout juizi-callout--tip bg-green bg-dark" style="background-color:var(--green);color:var(--green-foreground)"',
    );
    expect(html).toContain(
      'class="juizi-callout__icon" aria-hidden="true" style="color:var(--gold)"',
    );
    // Same pattern as the unified buttons: override VLT's link variable.
    expect(html).toContain(
      'style="--link-foreground-color:var(--fadedgold);color:var(--fadedgold)"',
    );
  });

  it('lets the link follow the text colour when no link colour is set', () => {
    const { container } = renderView({
      data: {
        '@type': 'juiziCallout',
        calloutType: 'tip',
        link: [{ '@id': '/page' }],
      },
    });
    const link = container.querySelector('.juizi-callout__link');
    expect(link.style.getPropertyValue('--link-foreground-color')).toBe(
      'currentColor',
    );
    expect(container.querySelector('.juizi-callout').className).not.toContain(
      'bg-',
    );
  });

  it('seeds the colours the site set for a type', () => {
    setRuntimeSettings({
      ...DEFAULT_SETTINGS,
      color_config: {
        ...DEFAULT_SETTINGS.color_config,
        blocks: {
          juiziCallout: {
            calloutTypes: {
              warning: { background: 'fadedgold', icon: 'gold' },
              tip: { icon: 'removed-colour' },
            },
          },
        },
      },
    });
    try {
      expect(getInitialDataForType('warning')).toEqual({
        calloutType: 'warning',
        icon: 'alert-triangle',
        backgroundColor: 'var(--fadedgold)',
        iconColor: 'var(--gold)',
      });
      // Colours that no longer exist are skipped.
      expect(getInitialDataForType('tip')).toEqual({
        calloutType: 'tip',
        icon: 'lightbulb',
      });
      // Changing type swaps only what the editor hasn't changed.
      const seeded = getInitialDataForType('warning');
      expect(changeCalloutType(seeded, 'tip')).toEqual({
        calloutType: 'tip',
        icon: 'lightbulb',
      });
      expect(
        changeCalloutType(
          { ...seeded, icon: 'star', backgroundColor: 'var(--green)' },
          'tip',
        ),
      ).toEqual({
        calloutType: 'tip',
        icon: 'star',
        backgroundColor: 'var(--green)',
      });
    } finally {
      setRuntimeSettings(DEFAULT_SETTINGS);
    }
  });

  it('warns editors when the icon colour clashes with the background', () => {
    const { container } = renderView({
      data: {
        '@type': 'juiziCallout',
        calloutType: 'tip',
        title: 'Hi',
        backgroundColor: 'var(--green)',
        iconColor: 'var(--darkgreen)',
      },
      isEditMode: true,
    });
    expect(container.textContent).toContain('icon colour is hard to see');
    const live = renderView({
      data: {
        '@type': 'juiziCallout',
        calloutType: 'tip',
        title: 'Hi',
        backgroundColor: 'var(--green)',
        iconColor: 'var(--darkgreen)',
      },
    });
    expect(live.container.textContent).not.toContain('hard to see');
  });

  it('seeds the icon on the first choice only', () => {
    expect(getInitialDataForType('warning')).toEqual({
      calloutType: 'warning',
      icon: 'alert-triangle',
    });
    expect(callout.usesColors).toBe(true);
    expect(callout.usesThemes).toBeUndefined();
  });
});
