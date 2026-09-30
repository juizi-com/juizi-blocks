/**
 * Test helpers.
 *
 * renderWithIntl: React Testing Library's `render` inside the IntlProvider
 * every Juizi view needs. English by default; pass `locale` and `messages`
 * to render in another language.
 *
 * readTranslations: the add-on's translations for a language, read from
 * locales/<language>/LC_MESSAGES/volto.po, as { id: translation }.
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

const LOCALES = path.join(__dirname, '..', '..', '..', '..', 'locales');

/** { id: { defaultMessage, translation } } from a language's .po file. */
export const readPo = (language) => {
  const text = fs.readFileSync(
    path.join(LOCALES, language, 'LC_MESSAGES', 'volto.po'),
    'utf8',
  );
  const entries = {};
  const pattern =
    /#\. Default: "(.*)"\n(?:#: .*\n)+msgid "(.*)"\nmsgstr "(.*)"/g;
  let match = pattern.exec(text);
  while (match) {
    entries[match[2]] = {
      defaultMessage: match[1].replace(/\\"/g, '"'),
      translation: match[3],
    };
    match = pattern.exec(text);
  }
  return entries;
};

export const readTranslations = (language) =>
  Object.fromEntries(
    Object.entries(readPo(language))
      .filter(([, entry]) => entry.translation)
      .map(([id, entry]) => [id, entry.translation]),
  );

export const renderWithIntl = (
  ui,
  { locale = 'en', messages, ...options } = {},
) =>
  render(
    <IntlProvider locale={locale} messages={messages}>
      {ui}
    </IntlProvider>,
    options,
  );
