import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import View from './View';
import schema from './schema';

jest.mock('../_shared/BlockWrapper');
jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'http://localhost:3000',
    apiPath: '',
    externalRoutes: [],
  },
  blocks: { blocksConfig: {} },
}));

const renderHero = (props) =>
  render(
    <Provider store={configureStore()({ breadcrumbs: { items: [] } })}>
      <View block="hero1" {...props} />
    </Provider>,
  );

describe('Hero', () => {
  it('starts a Section band with its own heading, not the page title (H1)', () => {
    // getChangedData is not exported; the seeded data shows in the schema.
    const { HeroEdit } = jest.requireActual('./index');
    expect(HeroEdit).toBeDefined();
    const fields = (data) =>
      schema({ data }).fieldsets.find((f) => f.id === 'content').fields;
    const section = {
      blockMode: 'section',
      usePageTitle: false,
      usePageDescription: false,
    };
    expect(fields(section)).toEqual(
      expect.arrayContaining(['title', 'subtitle']),
    );
    const { container } = renderHero({
      data: section,
      properties: { title: 'Page title', description: 'Page description' },
      isEditMode: true,
    });
    expect(container.textContent).not.toContain('Page title');
    expect(container.textContent).toContain('Add a heading in the sidebar.');
  });

  it('keeps saved Section bands without the switch on the page title', () => {
    const { container } = renderHero({
      data: { blockMode: 'section' },
      properties: { title: 'Page title' },
    });
    expect(container.textContent).toContain('Page title');
  });

  it('never shows visitors an unfinished button; flags it for editors (H7)', () => {
    const data = {
      blockMode: 'hero',
      buttons: [
        { '@id': 'a', label: 'Read', link: [{ '@id': '/read' }] },
        { '@id': 'b', label: 'No link yet', link: [] },
      ],
    };
    const live = renderHero({ data, properties: { title: 'T' } });
    expect(live.container.querySelectorAll('a.hero-button')).toHaveLength(1);
    expect(live.container.textContent).not.toContain('Click here');
    // Editors: with text or a finished button already there, no prompt.
    const edit = renderHero({
      data,
      properties: { title: 'T' },
      isEditMode: true,
    });
    expect(edit.container.querySelector('.block__unfinished')).toBeNull();
    // Only when the Hero has nothing else in it.
    const empty = renderHero({
      data: { blockMode: 'hero', buttons: [data.buttons[1]] },
      properties: {},
      isEditMode: true,
    });
    expect(
      empty.container.querySelector('.block__unfinished').textContent,
    ).toBe('Add a link');
  });

  it('uses the shared small button size for "Use smaller buttons"', () => {
    const { container } = renderHero({
      data: {
        blockMode: 'hero',
        smallButtons: true,
        buttons: [{ '@id': 'a', label: 'Read', link: [{ '@id': '/read' }] }],
      },
      properties: { title: 'T' },
    });
    expect(container.querySelector('a.hero-button.btn-small')).not.toBeNull();
  });

  it('marks the primary heading on its own wrapper, not on <body> (H2)', () => {
    const { container } = renderHero({
      data: { blockMode: 'hero', isPrimaryHeading: true },
      properties: { title: 'T' },
    });
    expect(
      container.querySelector('.hero-block--primary-heading'),
    ).not.toBeNull();
    expect(document.body.className).not.toContain('has-hero');
  });

  it('warns editors when another Hero is also the primary heading', () => {
    const { container } = renderHero({
      data: { blockMode: 'hero', isPrimaryHeading: true },
      properties: {
        title: 'T',
        blocks: {
          hero1: {
            '@type': 'juiziHero',
            blockMode: 'hero',
            isPrimaryHeading: true,
          },
          hero2: {
            '@type': 'juiziHero',
            blockMode: 'hero',
            isPrimaryHeading: true,
          },
        },
      },
      isEditMode: true,
    });
    expect(container.textContent).toContain(
      'Another block is already the main heading',
    );
  });

  it('formats the publication date in British English (H6)', () => {
    const { container } = renderHero({
      data: { blockMode: 'hero', showPublicationDate: true },
      properties: { title: 'T', effective: '2024-11-13T10:00:00' },
    });
    expect(container.textContent).toContain('13 November 2024');
  });
});
