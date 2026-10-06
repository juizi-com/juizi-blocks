import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithIntl as render } from '../_shared/testUtils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
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
jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () =>
  // Like Volto's: `openLinkInNewTab` becomes target="_blank" (the caller
  // passes rel, and the children come in through props).
  ({ href, openLinkInNewTab, ...props }) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content, react/jsx-no-target-blank
    <a
      href={href}
      target={openLinkInNewTab ? '_blank' : undefined}
      {...props}
    />
  ),
);
jest.mock('@plone/volto/actions', () => ({
  searchContent: () => ({ type: 'SEARCH_CONTENT' }),
}));

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  global.IntersectionObserver = global.IntersectionObserver || NoopObserver;
  global.ResizeObserver = global.ResizeObserver || NoopObserver;
});

const renderGallery = (data, state = {}, props = {}) =>
  render(
    <Provider
      store={configureStore([thunk])({
        content: { data: { '@id': '/page' } },
        search: { subrequests: {} },
        ...state,
      })}
    >
      <View
        id="gal123"
        data={{ '@type': 'emblaGallery', ...data }}
        {...props}
      />
    </Provider>,
  );

describe('Gallery', () => {
  it('describes its styles in plain words (G1)', () => {
    renderGallery({}, {}, { isEditMode: true });
    ['Slideshow', 'Even grid', 'Natural grid'].forEach((name) =>
      expect(screen.getByText(name)).toBeTruthy(),
    );
    expect(document.body.textContent).not.toMatch(/breakpoint|CSS-column/);
  });

  it('shows a skeleton while loading, not "No pictures found" (G2)', () => {
    const { container } = renderGallery(
      { displayMode: 'blocks', sourceMode: 'context' },
      { search: { subrequests: { 'gal123-context': { loading: true } } } },
      { isEditMode: true },
    );
    expect(container.querySelector('.block-skeleton')).not.toBeNull();
    expect(container.textContent).not.toContain('No pictures found');
  });

  it('opens pictures through real buttons (G5)', () => {
    const { container } = renderGallery(
      { displayMode: 'blocks', sourceMode: 'context', enableLightbox: true },
      {
        search: {
          subrequests: {
            'gal123-context': {
              loaded: true,
              items: [{ '@id': '/page/a.jpg', '@type': 'Image', title: 'A' }],
            },
          },
        },
      },
    );
    const trigger = container.querySelector('button.gallery__trigger');
    expect(trigger.getAttribute('aria-label')).toBe('Enlarge: A');
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it("opens a picture's page in a new tab when not enlarging", () => {
    const { container } = renderGallery(
      { displayMode: 'blocks', sourceMode: 'context', enableLightbox: false },
      {
        search: {
          subrequests: {
            'gal123-context': {
              loaded: true,
              items: [{ '@id': '/page/a.jpg', '@type': 'Image', title: 'A' }],
            },
          },
        },
      },
    );
    const link = container.querySelector('a.gallery__trigger');
    expect(link.getAttribute('href')).toBe('/page/a.jpg');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.querySelector('button.gallery__trigger')).toBeNull();
  });

  it('hides phone columns for the Natural grid (G4)', () => {
    const layout = (displayMode) =>
      schema({ data: { displayMode } }).fieldsets.find((f) => f.id === 'layout')
        .fields;
    expect(layout('masonry')).not.toContain('columnsMobile');
    expect(layout('blocks')).toContain('columnsMobile');
  });

  it('has no manual text-colour field (C4)', () => {
    const { fieldsets } = schema({ data: { displayMode: 'blocks' } });
    expect(fieldsets.flatMap((f) => f.fields)).not.toContain('textTone');
  });
});
