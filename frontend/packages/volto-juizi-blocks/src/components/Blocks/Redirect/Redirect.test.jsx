import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import View from './View';
import { isRedirectLoop, isSamePage, rememberRedirect } from './redirectTarget';

jest.mock('../_shared/BlockWrapper');
jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'http://localhost:3000',
    apiPath: '',
    externalRoutes: [],
  },
  blocks: { blocksConfig: {} },
}));

const renderView = (
  data,
  { loggedIn = false, page = '/here', isEditMode = false } = {},
) => {
  const store = configureStore()({
    content: { data: { '@id': page } },
    userSession: { token: loggedIn ? 'x' : null },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <View
          data={{ '@type': 'redirectBlock', ...data }}
          blocksConfig={{}}
          isEditMode={isEditMode}
        />
      </MemoryRouter>
    </Provider>,
  );
};

describe('Redirect view', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('shows visitors nothing when no destination is set', () => {
    const { container } = renderView({});
    expect(container.textContent).toBe('');
  });

  it('explains a missing destination to logged-in users', () => {
    const { container } = renderView({}, { loggedIn: true });
    expect(container.textContent).toContain('no destination yet');
    expect(container.textContent).not.toContain('Redirect block');
  });

  it('never redirects a page to itself', () => {
    const { container } = renderView({ url: [{ '@id': '/here' }] });
    expect(container.textContent).toBe('');
    expect(isSamePage('/here/', '/here')).toBe(true);
  });

  it('counts down for visitors, including older string URLs', () => {
    const { container } = renderView({ url: '/elsewhere' });
    expect(container.textContent).toContain('Redirecting');
  });

  it('lets visitors skip the countdown, named by the page name', () => {
    const { container, getByText } = renderView({
      url: [{ '@id': '/elsewhere' }],
      pageName: 'Our events',
    });
    expect(container.textContent).toContain('Taking you to Our events');
    expect(getByText('Go now').getAttribute('href')).toBe('/elsewhere');
  });

  it('shows logged-in users the page name and a link to go there', () => {
    const { container, getByText } = renderView(
      { url: [{ '@id': '/elsewhere' }], pageName: 'Our events' },
      { loggedIn: true },
    );
    expect(container.textContent).toContain(
      'Visitors will be sent to Our events (/elsewhere)',
    );
    expect(getByText('Go to Our events now').getAttribute('href')).toBe(
      '/elsewhere',
    );
  });

  it('shows editors a start screen, then what is set, never redirecting', () => {
    const empty = renderView({}, { loggedIn: true, isEditMode: true });
    expect(empty.container.textContent).toContain("'Send visitors to'");
    const set = renderView(
      { url: [{ '@id': '/elsewhere' }] },
      { loggedIn: true, isEditMode: true },
    );
    expect(set.container.textContent).toContain(
      'Visitors will be sent to /elsewhere',
    );
    expect(set.container.textContent).not.toContain('Redirecting');
    // No link that would leave the edit form
    expect(set.container.querySelector('.redirect-block__go')).toBeNull();
  });

  it('remembers recent redirects to stop loops', () => {
    expect(isRedirectLoop('/a', 1000)).toBe(false);
    rememberRedirect('/a', 1000);
    expect(isRedirectLoop('/a/', 5000)).toBe(true);
    expect(isRedirectLoop('/a', 20000)).toBe(false);
  });
});
