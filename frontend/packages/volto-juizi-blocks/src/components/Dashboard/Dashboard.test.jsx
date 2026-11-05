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

const idle = { loading: false, loaded: true, error: null };

const renderDashboard = (userActions, hash = '') => {
  const store = configureStore()({
    juiziBlocksSettings: {
      data: DEFAULT_SETTINGS,
      installed: true,
      printSupported: true,
      get: idle,
      update: idle,
    },
    actions: { actions: { user: userActions } },
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

  it('offers Export and import to people who can see Site Setup', () => {
    renderDashboard([{ id: 'plone_setup' }, { id: 'logout' }]);
    expect(tabNames()).toEqual([
      'Blocks',
      'Colours',
      'Print',
      'Export and import',
    ]);
  });

  it('leaves Export and import out for everybody else', () => {
    renderDashboard([{ id: 'logout' }]);
    expect(tabNames()).toEqual(['Blocks', 'Colours', 'Print']);
  });

  it('shows Blocks when linked to Export and import without the rights', () => {
    renderDashboard([], '#transfer');
    expect(
      screen.getByRole('tab', { name: 'Blocks' }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(screen.queryByText('Download settings')).toBeNull();
  });

  it('opens on Export and import when linked to it', () => {
    renderDashboard([{ id: 'plone_setup' }], '#transfer');
    expect(screen.getByText('Download settings')).toBeTruthy();
  });

  it('loads the user’s actions itself, as a control panel has no content', () => {
    const store = renderDashboard([]);
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({
        type: 'LIST_ACTIONS',
        request: expect.objectContaining({ path: '/@actions' }),
      }),
    );
  });
});
