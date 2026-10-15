#!/usr/bin/env node
/**
 * Writes src/locales/<language>.json from locales/<language>/LC_MESSAGES/
 * volto.po: { message id: translation }, translated messages only.
 *
 * The dashboard's "Editing language" setting shows the Juizi blocks'
 * editing interface in a language other than the page's, so the browser
 * loads these on demand (src/editorLanguage). They can't come from the
 * site's own locales/*.json: a site only builds those for its own
 * languages.
 *
 * Run after `i18n` (the package's `i18n` script does both). A test
 * (src/editorLanguage/locales.test.js) fails when they're out of date.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES = path.join(ROOT, 'locales');
const OUT = path.join(ROOT, 'src', 'locales');

// The languages the editing interface can be shown in, as directory names
// (Volto's gettext form). English uses the messages' own defaults.
const LANGUAGES = ['fr', 'pt', 'pt_BR', 'es', 'af'];

// The text between a line's outer quotes, unescaped. Tolerant of quotes
// left unescaped inside a translation, as the add-on's tests are.
const unquote = (line) =>
  line
    .trim()
    .slice(1, -1)
    .replace(/\\(["\\nt])/g, (match, char) =>
      ({ n: '\n', t: '\t' })[char] ?? char,
    );

/** { id: translation } from a .po file's text. */
const parsePo = (text) => {
  const messages = {};
  let key = null;
  let current = null;
  let entry = {};
  const flush = () => {
    if (entry.msgid && entry.msgstr) messages[entry.msgid] = entry.msgstr;
    entry = {};
    current = null;
  };
  text.split('\n').forEach((line) => {
    if (line.startsWith('msgid ')) {
      flush();
      key = 'msgid';
      current = unquote(line.slice(6));
      entry.msgid = current;
    } else if (line.startsWith('msgstr ')) {
      key = 'msgstr';
      entry.msgstr = unquote(line.slice(7));
    } else if (line.startsWith('"') && key) {
      entry[key] += unquote(line);
    } else if (!line.trim()) {
      key = null;
    }
  });
  flush();
  return messages;
};

const run = () => {
  fs.mkdirSync(OUT, { recursive: true });
  LANGUAGES.forEach((language) => {
    const po = path.join(LOCALES, language, 'LC_MESSAGES', 'volto.po');
    const messages = parsePo(fs.readFileSync(po, 'utf8'));
    const sorted = Object.fromEntries(
      Object.keys(messages)
        .sort()
        .map((id) => [id, messages[id]]),
    );
    fs.writeFileSync(
      path.join(OUT, `${language}.json`),
      `${JSON.stringify(sorted, null, 2)}\n`,
    );
  });
};

if (require.main === module) run();

module.exports = { LANGUAGES, parsePo };
