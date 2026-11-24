import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Dashboard from './Dashboard';
import { DEFAULT_SETTINGS } from '../../settings';

jest.mock('@plone/volto/components/manage/Toolbar/Toolbar', () => () => null);
// Only the tabs matter here: no blocks, and no Volto Light Theme.
jest.mock('../../blocks', () => ({ juiziBlocks: [] }));
jest.mock('../../config/vlt', () => ({ hasVLT: () => false }));
jest.mock(
  '@plone/volto/components/theme/Unauthorized/Unauthorized',
  () => () => <h1>Unauthorized</h1>,
);

const idle = { loading: false, loaded: true, error: null };

/** The backend's answer to the settings request: its result, an error, or
 * `pending` (never answers). */
const backend = (answer) => () => (next) => (action) => {
  next(action);
  if (action.type !== 'GET_JUIZI_BLOCKS_SETTINGS') return action;
  if (answer === 'pending') return new Promise(() => {});
  return answer instanceof Error
    ? Promise.reject(answer)
    : Promise.resolve(answer);
};

const notFound = Object.assign(new Error('Not found'), { status: 404 });

const renderDashboard = (
  answer,
  hash = '',
  { token = 'abc', installed = true } = {},
) => {
  const store = configureStore([backend(answer)])({
    juiziBlocksSettings: {
      data: DEFAULT_SETTINGS,
      installed,
      printSupported: true,
      get: idle,
      update: idle,
    },
    userSession: { token },
    groups: { list: { loaded: true }, groups: [] },
    intl: { locale: 'en', messages: {} },
  });
  render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <MemoryRouter initialEntries={[`/controlpanel/juizi-blocks${hash}`]}>
          <Dashboard />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
  return store;
};

const tabNames = () => screen.getAllByRole('tab').map((tab) => tab.textContent);

describe('Dashboard', () => {
  // The dashboard puts its Save button in Volto's toolbar.
  beforeEach(() => {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    document.body.appendChild(toolbar);
  });
  afterEach(() => document.getElementById('toolbar')?.remove());

  it('shows every tab to Managers', async () => {
    renderDashboard({ can_manage: true });
    await screen.findAllByRole('tab');
    expect(tabNames()).toEqual([
      'Blocks',
      'Colours',
      'Print',
      'Export and import',
    ]);
  });

  it('opens on the tab it is linked to', async () => {
    renderDashboard({ can_manage: true }, '#transfer');
    expect(await screen.findByText('Download settings')).toBeTruthy();
  });

  it('turns away anonymous visitors without asking the backend', () => {
    const store = renderDashboard({ can_manage: false }, '', { token: null });
    expect(screen.getByText('Unauthorized')).toBeTruthy();
    expect(store.getActions()).toEqual([]);
  });

  it('turns away Site Administrators and everybody else', async () => {
    const store = renderDashboard({ can_manage: false });
    expect(await screen.findByText('Unauthorized')).toBeTruthy();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(store.getActions()).not.toContainEqual(
      expect.objectContaining({ type: 'LIST_GROUPS' }),
    );
  });

  it('turns people away when the backend fails', async () => {
    renderDashboard(Object.assign(new Error('Oops'), { status: 500 }));
    expect(await screen.findByText('Unauthorized')).toBeTruthy();
  });

  it('says the add-on is not installed when the backend lacks it', async () => {
    renderDashboard(notFound, '', { installed: false });
    expect(
      await screen.findByText(/is not installed on this site/),
    ).toBeTruthy();
    expect(screen.queryByText('Unauthorized')).toBeNull();
  });

  it('shows neither tabs nor Unauthorized while it asks', () => {
    renderDashboard('pending');
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByText('Unauthorized')).toBeNull();
  });

  it('asks the backend afresh each time it opens', () => {
    const store = renderDashboard('pending');
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({ type: 'GET_JUIZI_BLOCKS_SETTINGS' }),
    );
  });
});
