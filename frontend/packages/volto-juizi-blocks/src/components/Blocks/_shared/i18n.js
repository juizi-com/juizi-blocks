/**
 * Translation helper for code that isn't a React component (schemas, choice
 * lists).
 *
 *   const t = translator(args.intl);
 *   title: t(messages.heading)
 *   label: t(messages.custom, { label: '5 seconds' })
 *
 * makeBlockEdit passes `intl` to every schema. Without it (tests, or code
 * that calls a schema directly) the English default is used.
 */
const PLURAL = /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g;

const formatDefault = (message, values = {}) =>
  (message?.defaultMessage || '')
    .replace(PLURAL, (match, key, one, other) =>
      (Number(values[key]) === 1 ? one : other).replace('#', values[key]),
    )
    .replace(/\{(\w+)\}/g, (match, key) =>
      key in values ? values[key] : match,
    );

export const translator = (intl) => (message, values) =>
  intl ? intl.formatMessage(message, values) : formatDefault(message, values);

/**
 * A translated message as a CSS string, for `content:` in a stylesheet
 * (which can't be translated): `:root{--my-note:${cssString(text)}}`.
 */
export const cssString = (text) =>
  `"${text.replace(/[\\"]/g, '\\$&').replace(/</g, '\\3c ')}"`;
