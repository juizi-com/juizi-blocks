import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider, useIntl } from 'react-intl';
import EditorLanguage, { withEditorLanguage } from './EditorLanguage';
import { useJuiziBlocksSettings } from '../settings/hooks';
import loadMessages from './loadMessages';

jest.mock('../settings/hooks', () => ({ useJuiziBlocksSettings: jest.fn() }));
jest.mock('./loadMessages', () => ({
  __esModule: true,
  default: jest.fn(),
  cachedMessages: () => undefined,
}));
jest.mock('@plone/volto/helpers/Utils/Utils', () => ({
  toReactIntlLang: (code) =>
    code.includes('-')
      ? `${code.split('-')[0]}-${code.split('-')[1].toUpperCase()}`
      : code,
}));

// A plain object, not defineMessages, so `pnpm i18n` doesn't extract it.
const heading = { id: 'juizi-test-heading', defaultMessage: 'Heading' };

const Label = () => {
  const intl = useIntl();
  return (
    <p>
      {intl.locale}: {intl.formatMessage(heading)}
    </p>
  );
};

const renderIn = (pageLanguage, editorLanguage, ui = <Label />) => {
  useJuiziBlocksSettings.mockReturnValue({ editor_language: editorLanguage });
  return render(
    <IntlProvider
      locale={pageLanguage}
      messages={{ 'juizi-test-heading': 'Título' }}
    >
      <EditorLanguage>{ui}</EditorLanguage>
    </IntlProvider>,
  );
};

describe('EditorLanguage', () => {
  beforeEach(() => loadMessages.mockReset());

  it("keeps the page's language when nothing is chosen", () => {
    renderIn('pt', '');
    expect(screen.getByText('pt: Título')).toBeInTheDocument();
    expect(loadMessages).not.toHaveBeenCalled();
  });

  it('loads nothing when the choice is the page language', () => {
    renderIn('pt', 'pt');
    expect(screen.getByText('pt: Título')).toBeInTheDocument();
    expect(loadMessages).not.toHaveBeenCalled();
  });

  it('switches to the chosen language once it has loaded', async () => {
    loadMessages.mockResolvedValue({ 'juizi-test-heading': 'Titre' });
    renderIn('pt', 'fr');
    expect(screen.getByText('pt: Título')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('fr: Titre')).toBeInTheDocument(),
    );
    expect(loadMessages).toHaveBeenCalledWith('fr');
  });

  it('falls back to English for messages it lacks', async () => {
    loadMessages.mockResolvedValue({});
    renderIn('pt', 'en');
    await waitFor(() =>
      expect(screen.getByText('en: Heading')).toBeInTheDocument(),
    );
  });

  it('wraps an edit component once', () => {
    const Edit = () => null;
    const wrapped = withEditorLanguage(Edit);
    expect(wrapped).not.toBe(Edit);
    expect(withEditorLanguage(wrapped)).toBe(wrapped);
    expect(withEditorLanguage(undefined)).toBeUndefined();
  });
});
