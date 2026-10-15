/**
 * src/locales/*.json are generated from locales/<lang>/LC_MESSAGES/volto.po
 * by scripts/locales-json.js (part of `pnpm i18n`). Fails when a .po file
 * changed without regenerating them.
 */
import fs from 'fs';
import path from 'path';

const { LANGUAGES, parsePo } = require('../../scripts/locales-json');

const ROOT = path.join(__dirname, '..', '..');

describe('editing language translations', () => {
  it.each(LANGUAGES)('src/locales/%s.json matches its .po file', (lang) => {
    const po = fs.readFileSync(
      path.join(ROOT, 'locales', lang, 'LC_MESSAGES', 'volto.po'),
      'utf8',
    );
    const json = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, 'src', 'locales', `${lang}.json`),
        'utf8',
      ),
    );
    expect(json).toEqual(parsePo(po));
  });

  it('offers the languages the backend accepts', () => {
    const { EDITOR_LANGUAGES } = require('../settings/constants');
    expect(EDITOR_LANGUAGES.map((language) => language.code)).toEqual([
      'en',
      'fr',
      'pt',
      'pt-br',
      'es',
      'af',
    ]);
  });
});
