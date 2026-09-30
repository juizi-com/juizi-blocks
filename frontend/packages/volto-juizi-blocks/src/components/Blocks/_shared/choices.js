/**
 * Choice lists shared by several blocks' schemas.
 */

/** Text alignment as words, not icons (the skill forbids icon-only
 * controls). Stored values match Volto's align widget. */
export const alignmentChoices = [
  ['left', 'Left'],
  ['center', 'Centre'],
  ['right', 'Right'],
];

/** Block padding steps (Hero, Content Row). */
export const paddingChoices = [
  ['none', 'None'],
  ['compact', 'Compact'],
  ['default', 'Default'],
  ['spacious', 'Spacious'],
  ['extra-spacious', 'Extra spacious'],
];

/**
 * Named choices for a field that used to be a free number (or a list that
 * lost an option). A saved value that isn't one of the choices is added as
 * "Custom (…)", so the select shows it instead of going blank, and the block
 * keeps rendering it as stored.
 *
 *   withSavedChoice(choices, data.autoplayDelay, (v) => `${v / 1000} seconds`)
 *
 * Values come back as strings: Volto's select widget can only show the
 * label of a string value (see withStringChoiceValues in BlockEdit.jsx).
 * Views read them with parseInt, so saved numbers and strings both work.
 */
export const withSavedChoice = (choices, savedValue, formatLabel) => {
  const asStrings = choices.map(([value, label]) => [String(value), label]);
  if (savedValue === undefined || savedValue === null || savedValue === '')
    return asStrings;
  // Stored values may be numbers or numeric strings.
  const matches = asStrings.some(([value]) => value === String(savedValue));
  if (matches) return asStrings;
  const label = formatLabel ? formatLabel(savedValue) : String(savedValue);
  return [...asStrings, [String(savedValue), `Custom (${label})`]];
};

/** "4 seconds" from a millisecond value. */
export const msToSeconds = (ms) => {
  const seconds = Number(ms) / 1000;
  return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} second${seconds === 1 ? '' : 's'}`;
};
