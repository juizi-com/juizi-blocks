import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import TransferPanel from './TransferPanel';
import { buildTransferFile, DEFAULT_SETTINGS } from '../../settings';

const saved = { ...DEFAULT_SETTINGS, disabled_blocks: ['juiziGallery'] };

const otherSite = {
  ...DEFAULT_SETTINGS,
  editor_language: 'pt',
  block_groups: { juiziHero: ['writers'] },
  color_config: {
    ...DEFAULT_SETTINGS.color_config,
    colors: DEFAULT_SETTINGS.color_config.colors.map((color) =>
      color.name === 'darkblue' ? { ...color, value: '#000000' } : color,
    ),
  },
};

const renderPanel = (props = {}) => {
  const onImport = jest.fn();
  render(
    <IntlProvider locale="en">
      <TransferPanel
        saved={saved}
        draft={saved}
        dirty={false}
        site="https://plone.org"
        addonVersion="1.0.0"
        userGroups={[{ id: 'editors' }]}
        onImport={onImport}
        {...props}
      />
    </IntlProvider>,
  );
  return onImport;
};

const pick = (text, name = 'settings.json') =>
  fireEvent.change(screen.getByLabelText('Choose a file…'), {
    target: { files: [new File([text], name, { type: 'application/json' })] },
  });

const exportedText = JSON.stringify(
  buildTransferFile(otherSite, {
    site: 'https://dev.plone.org',
    addonVersion: '1.0.0',
  }),
);

describe('TransferPanel', () => {
  let created;
  beforeEach(() => {
    created = [];
    global.URL.createObjectURL = jest.fn((blob) => {
      created.push(blob);
      return 'blob:settings';
    });
    global.URL.revokeObjectURL = jest.fn();
  });

  it('downloads the saved settings', async () => {
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function () {
        expect(this.download).toMatch(
          /^juizi-blocks-settings-plone\.org-\d{4}-\d{2}-\d{2}\.json$/,
        );
      });
    renderPanel({ draft: { ...saved, editor_language: 'fr' }, dirty: true });

    fireEvent.click(screen.getByRole('button', { name: 'Download settings' }));

    expect(click).toHaveBeenCalled();
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(created[0]);
    });
    const file = JSON.parse(text);
    expect(file.site).toBe('https://plone.org');
    // The saved settings, not the unsaved draft.
    expect(file.settings.disabled_blocks).toEqual(['juiziGallery']);
    expect(file.settings.editor_language).toBe('');
    click.mockRestore();
  });

  it('warns that unsaved changes are not exported', () => {
    renderPanel({ dirty: true });
    expect(screen.getByText(/You have unsaved changes/)).toBeTruthy();
  });

  it('imports the chosen parts into the draft', async () => {
    const onImport = renderPanel();
    pick(exportedText);

    const parts = await screen.findByRole('group', {
      name: 'Parts to import',
    });
    expect(
      screen.getByText(/exported from https:\/\/dev\.plone\.org/),
    ).toBeTruthy();
    // Every part starts ticked; untick the editing language.
    fireEvent.click(within(parts).getByLabelText('Editing language'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Import the chosen parts' }),
    );

    const draft = onImport.mock.calls[0][0];
    expect(draft.color_config).toEqual(otherSite.color_config);
    expect(draft.block_groups).toEqual({ juiziHero: ['writers'] });
    expect(draft.editor_language).toBe('');
    expect(screen.getByRole('status').textContent).toMatch(
      /^Imported: .*Nothing is saved yet/,
    );
  });

  it('warns about user groups this site lacks', async () => {
    renderPanel();
    pick(exportedText);
    expect(
      await screen.findByText(/user groups this site doesn’t have: writers/),
    ).toBeTruthy();
  });

  it('refuses a file that is not a settings file', async () => {
    const onImport = renderPanel();
    pick('{"name": "package"}', 'package.json');
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /“package\.json” isn’t a Juizi Blocks settings file/,
    );
    expect(
      screen.queryByRole('button', { name: 'Import the chosen parts' }),
    ).toBeNull();
    expect(onImport).not.toHaveBeenCalled();
  });

  it('can be cancelled without importing', async () => {
    const onImport = renderPanel();
    pick(exportedText);
    await screen.findByRole('group', { name: 'Parts to import' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('group', { name: 'Parts to import' }),
      ).toBeNull(),
    );
    expect(onImport).not.toHaveBeenCalled();
  });
});
