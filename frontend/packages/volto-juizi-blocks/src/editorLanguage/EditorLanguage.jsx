/**
 * Shows what it wraps (a Juizi block's editor: canvas and sidebar) in the
 * dashboard's "Editing language", whatever the page's language. Without
 * that setting, or when it's the page's language, nothing changes. Only the
 * editor is wrapped, so visitors always get the page's language.
 *
 * The provider is always there (with the page's own messages until the
 * chosen language has loaded), so switching never remounts the block.
 */
import React, { useEffect, useState } from 'react';
import { IntlProvider, useIntl } from 'react-intl';
import { toReactIntlLang } from '@plone/volto/helpers/Utils/Utils';
import { useJuiziBlocksSettings } from '../settings/hooks';
import loadMessages, { cachedMessages } from './loadMessages';

// Messages missing in the chosen language fall back to English without
// filling the console.
const ignoreMissing = (error) => {
  if (error?.code !== 'MISSING_TRANSLATION') {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const EditorLanguage = ({ children }) => {
  const intl = useIntl();
  const language = useJuiziBlocksSettings().editor_language || '';
  const locale = language ? toReactIntlLang(language) : intl.locale;
  const override = !!language && locale !== intl.locale;
  const [messages, setMessages] = useState(() => {
    const cached = override && cachedMessages(language);
    return cached && !cached.then ? cached : null;
  });

  useEffect(() => {
    if (!override) return undefined;
    let live = true;
    loadMessages(language).then((next) => live && setMessages(next));
    return () => {
      live = false;
    };
  }, [language, override]);

  const ready = override && messages;
  return (
    <IntlProvider
      locale={ready ? locale : intl.locale}
      messages={ready ? messages : intl.messages}
      defaultLocale="en"
      onError={ignoreMissing}
    >
      {children}
    </IntlProvider>
  );
};

/** `Edit` wrapped in EditorLanguage. */
export const withEditorLanguage = (Edit) => {
  if (!Edit || Edit.juiziEditorLanguage) return Edit;
  const WithEditorLanguage = (props) => (
    <EditorLanguage>
      <Edit {...props} />
    </EditorLanguage>
  );
  WithEditorLanguage.displayName = `withEditorLanguage(${
    Edit.displayName || Edit.name || 'Edit'
  })`;
  WithEditorLanguage.juiziEditorLanguage = true;
  return WithEditorLanguage;
};

export default EditorLanguage;
