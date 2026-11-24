import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import config from '@plone/volto/registry';
import Dashboard from './Dashboard';
import { DEFAULT_SETTINGS } from '../../settings';

jest.mock('@plone/volto/components/manage/Toolbar/Toolbar', () => () => null);
// The Events calendar is in this build; nothing else matters here.
jest.mock('../../blocks', () => ({ juiziBlocks: [{ id: 'juiziCalendar' }] }));
jest.mock('../../config/vlt', () => ({ hasVLT: () => false }));
jest.mock('@plone/volto/helpers/Api/Api', () =>
  jest.fn().mockImplementation(() => ({
    get: jest.fn(() => new Promise(() => {})),
  })),
);

const idle = { loading: false, loaded: true, error: null };
const manager = () => () => (next) => (action) => {
  next(action);
  return action.type === 'GET_JUIZI_BLOCKS_SETTINGS'
    ? Promise.resolve({ can_manage: true })
    : action;
};

const renderDashboard = (lists) => {
  const store = configureStore([manager()])({
    juiziBlocksSettings: {
      data: { ...DEFAULT_SETTINGS, ...lists },
      installed: true,
      printSupported: true,
      get: idle,
      update: idle,
    },
    userSession: { token: 'abc' },
    groups: { list: { loaded: true }, groups: [] },
    intl: { locale: 'en', messages: {} },
  });
  render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <MemoryRouter initialEntries={['/controlpanel/juizi-blocks#calendar']}>
          <Dashboard />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
};

describe('Dashboard: the Calendar tab', () => {
  beforeAll(() => {
    config.blocks.blocksConfig.juiziCalendar = {
      id: 'juiziCalendar',
      restricted: true,
    };
  });
  beforeEach(() => {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    document.body.appendChild(toolbar);
  });
  afterEach(() => document.getElementById('toolbar')?.remove());

  it('says the calendar is off, and how to switch it on', async () => {
    renderDashboard({});
    expect(
      await screen.findByText(/The Events calendar is switched off/),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Go to the Blocks tab' }),
    );
    expect(
      screen.getByRole('tab', { name: 'Blocks' }).getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('shows its settings once switched on', async () => {
    renderDashboard({ enabled_blocks: ['juiziCalendar'] });
    expect(
      await screen.findByText('Loading the calendar settings…'),
    ).toBeTruthy();
    expect(screen.queryByText(/switched off/)).toBeNull();
  });
});
