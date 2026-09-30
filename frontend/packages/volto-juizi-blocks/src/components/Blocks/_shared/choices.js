/**
 * Choice lists shared by several blocks' schemas. Each takes the schema's
 * translator (see i18n.js); without one the labels are in English.
 */
import messages from './messages';
import { translator } from './i18n';

/** Text alignment as words, not icons (the skill forbids icon-only
 * controls). Stored values match Volto's align widget. */
export const getAlignmentChoices = (t = translator()) => [
  ['left', t(messages.left)],
  ['center', t(messages.center)],
  ['right', t(messages.right)],
];

/** Block padding steps (Hero, Content Row). */
export const getPaddingChoices = (t = translator()) => [
  ['none', t(messages.none)],
  ['compact', t(messages.compact)],
  ['default', t(messages.default)],
  ['spacious', t(messages.spacious)],
  ['extra-spacious', t(messages.extraSpacious)],
];

/** Top / Middle / Bottom (vertical alignment). */
export const getVerticalChoices = (t = translator()) => [
  ['top', t(messages.top)],
  ['middle', t(messages.middle)],
  ['bottom', t(messages.bottom)],
];

/**
 * Named choices for a field that used to be a free number (or a list that
 * lost an option). A saved value that isn't one of the choices is added as
 * "Custom (…)", so the select shows it instead of going blank, and the block
 * keeps rendering it as stored.
 *
 *   withSavedChoice(choices, data.autoplayDelay, (v) => msToSeconds(v, t), t)
 *
 * Values come back as strings: Volto's select widget can only show the
 * label of a string value (see withStringChoiceValues in BlockEdit.jsx).
 * Views read them with parseInt, so saved numbers and strings both work.
 */
export const withSavedChoice = (
  choices,
  savedValue,
  formatLabel,
  t = translator(),
) => {
  const asStrings = choices.map(([value, label]) => [String(value), label]);
  if (savedValue === undefined || savedValue === null || savedValue === '')
    return asStrings;
  // Stored values may be numbers or numeric strings.
  const matches = asStrings.some(([value]) => value === String(savedValue));
  if (matches) return asStrings;
  const label = formatLabel ? formatLabel(savedValue) : String(savedValue);
  return [...asStrings, [String(savedValue), t(messages.custom, { label })]];
};

/** "4 seconds" from a millisecond value. */
export const msToSeconds = (ms, t = translator()) => {
  const seconds = Number(ms) / 1000;
  return t(messages.seconds, {
    count: Number.isInteger(seconds) ? seconds : Number(seconds.toFixed(1)),
  });
};

/** "8 seconds" from a value already in seconds. */
export const secondsLabel = (count, t = translator()) =>
  t(messages.seconds, { count: Number(count) });
