import { getButtonChoices, getButtonClasses } from './colors';

const colors = [
  ['var(--teal)', 'Teal', 'dark'],
  ['var(--white)', 'White', 'light'],
];

describe('getButtonChoices', () => {
  it('offers solid and outlined for every colour', () => {
    expect(getButtonChoices(colors).map(([v]) => v)).toEqual([
      'solid__teal',
      'outline__teal',
      'solid__white',
      'outline__white',
    ]);
  });

  it('adds "Text only" only where link buttons ask for it', () => {
    const choices = getButtonChoices(colors, undefined, { textLinks: true });
    expect(choices.map(([v]) => v)).toEqual([
      'solid__teal',
      'outline__teal',
      'text__teal',
      'solid__white',
      'outline__white',
      'text__white',
    ]);
    expect(choices[2]).toEqual(['text__teal', 'Teal — Text only', 'dark']);
  });
});

describe('getButtonClasses', () => {
  it('marks a text-only button and keeps its colour', () => {
    const { className, style } = getButtonClasses('text__teal', 'row-button');
    expect(className.split(' ')).toEqual(
      expect.arrayContaining(['btn-unified', 'btn-text', 'row-button--text']),
    );
    expect(style['--btn-color']).toBe('var(--teal)');
  });
});
