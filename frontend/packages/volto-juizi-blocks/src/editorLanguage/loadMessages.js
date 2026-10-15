/**
 * The messages for showing the editing interface in `language` (Volto's
 * code: 'pt', 'pt-br'): Volto's own (the site's locales/<lang>.json, when the
 * site builds that language) with the add-on's (src/locales, always there)
 * on top. Loaded once per language and kept.
 */
import { toGettextLang } from '@plone/volto/helpers/Utils/Utils';

const loaded = {};

const loadVolto = (file) =>
  import(/* @vite-ignore */ '@root/../locales/' + file + '.json').catch(() => ({
    default: {},
  }));

const loadOwn = (file) =>
  file === 'en'
    ? Promise.resolve({ default: {} })
    : import('../locales/' + file + '.json').catch(() => ({ default: {} }));

export const cachedMessages = (language) => loaded[language];

export default function loadMessages(language) {
  if (!loaded[language]) {
    const file = toGettextLang(language);
    loaded[language] = Promise.all([loadVolto(file), loadOwn(file)]).then(
      ([volto, own]) => {
        const messages = { ...volto.default, ...own.default };
        loaded[language] = messages;
        return messages;
      },
    );
  }
  return Promise.resolve(loaded[language]);
}
