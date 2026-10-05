/**
 * The translations in ../locales. For the languages the add-on ships
 * translated (the others are scaffolding, falling back to English), every
 * message must be translated, use the same placeholders as the English
 * default, and be valid for react-intl.
 */
import { createIntl } from 'react-intl';
import { readPo } from './components/Blocks/_shared/testUtils';

const TRANSLATED = ['fr', 'pt', 'pt_BR', 'es', 'af'];

const placeholders = (message) =>
  [...new Set((message.match(/\{\w+/g) || []).map((name) => name.slice(1)))]
    .sort()
    .join(', ');

// A value for every placeholder the messages use.
const VALUES = {
  color: 'Green',
  count: 2,
  current: 2,
  date: '13 November 2024',
  groups: 'Editors',
  destination: '/news',
  label: 'Gold',
  name: 'gold',
  number: 3,
  on: 1,
  percent: 30,
  ratio: '4.5',
  seconds: 3,
  slot: 'Text',
  strength: 'Light',
  tag: 'News',
  title: 'Harbour',
  tone: 'dark',
  total: 9,
};

describe('locales', () => {
  const template = readPo('en');

  it('extracts the messages', () => {
    expect(Object.keys(template).length).toBeGreaterThan(500);
  });

  it.each(TRANSLATED)('%s is complete', (language) => {
    const entries = readPo(language);
    expect(Object.keys(entries).sort()).toEqual(Object.keys(template).sort());
    const untranslated = Object.keys(entries).filter(
      (id) => !entries[id].translation,
    );
    expect(untranslated).toEqual([]);
  });

  it.each(TRANSLATED)('%s keeps every placeholder', (language) => {
    const entries = readPo(language);
    const different = Object.keys(entries).filter(
      (id) =>
        placeholders(entries[id].translation) !==
        placeholders(entries[id].defaultMessage),
    );
    expect(different).toEqual([]);
  });

  it.each(TRANSLATED)('%s formats without errors', (language) => {
    const entries = readPo(language);
    const messages = Object.fromEntries(
      Object.entries(entries).map(([id, entry]) => [id, entry.translation]),
    );
    const errors = [];
    const intl = createIntl({
      locale: language.replace('_', '-'),
      messages,
      onError: (error) => errors.push(String(error)),
    });
    const leftovers = Object.keys(messages).filter((id) =>
      /[{}]/.test(intl.formatMessage({ id }, VALUES)),
    );
    expect(errors).toEqual([]);
    expect(leftovers).toEqual([]);
  });

  it('gives plurals their own forms', () => {
    const french = readPo('fr')['juizi-seconds'].translation;
    const intl = createIntl({ locale: 'fr', messages: { seconds: french } });
    expect(intl.formatMessage({ id: 'seconds' }, { count: 1 })).toBe(
      '1 seconde',
    );
    expect(intl.formatMessage({ id: 'seconds' }, { count: 4 })).toBe(
      '4 secondes',
    );
  });
});
