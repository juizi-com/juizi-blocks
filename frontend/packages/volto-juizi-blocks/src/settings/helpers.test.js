import { DEFAULT_COLOR_CONFIG } from './constants';
import {
  buildColorCss,
  colorForeground,
  contrastRatio,
  getBlockColors,
  getBlockDefaultTheme,
  getBlockThemes,
  removeColor,
  removeTheme,
  renameColor,
  slugifyName,
  suggestDark,
  toColorInputValue,
  toColorTuples,
  toVltTheme,
  validateColorConfig,
} from './helpers';

const config = {
  ...DEFAULT_COLOR_CONFIG,
  blocks: {
    contentRow: { colors: ['gold', 'white'] },
    juiziCallout: {
      themes: ['green', 'faded-blue'],
      defaultTheme: 'faded-blue',
    },
  },
};

describe('colours', () => {
  it('outputs each colour, its rgb channels and its text colour', () => {
    const css = buildColorCss({
      ...DEFAULT_COLOR_CONFIG,
      colors: [
        { name: 'green', label: 'Green', value: '#2e7d32', dark: true },
        {
          name: 'paper',
          label: 'Paper',
          value: '#fff',
          dark: false,
          foreground: '#333333',
        },
      ],
    });
    expect(css).toBe(
      ':root{--green:#2e7d32;--green-rgb:46,125,50;--green-foreground:#ffffff;--paper:#fff;--paper-rgb:255,255,255;--paper-foreground:#333333;}',
    );
  });

  it('skips entries that are not safe to put in a stylesheet', () => {
    const css = buildColorCss({
      ...DEFAULT_COLOR_CONFIG,
      colors: [
        { name: 'x}{', label: 'X', value: '#000', dark: true },
        { name: 'ok', label: 'Ok', value: 'red;}body{', dark: true },
      ],
    });
    expect(css).toBe('');
  });

  it('keeps the legacy [value, label, lightness] tuple format', () => {
    expect(toColorTuples(DEFAULT_COLOR_CONFIG.colors).slice(0, 2)).toEqual([
      ['var(--white)', 'White', 'light'],
      ['var(--green)', 'Green', 'dark'],
    ]);
  });

  it('suggests the dark flag from the colour', () => {
    expect(suggestDark('#ffffff')).toBe(false);
    expect(suggestDark('#fadedc')).toBe(false);
    expect(suggestDark('#123e6b')).toBe(true);
    expect(suggestDark('#000')).toBe(true);
  });

  it('derives the text colour unless one is set', () => {
    expect(colorForeground({ dark: true, value: '#000' })).toBe('#ffffff');
    expect(colorForeground({ dark: false, value: '#fff' })).toBe('#111111');
    expect(
      colorForeground({ dark: false, value: '#fff', foreground: '#123456' }),
    ).toBe('#123456');
  });

  it('measures contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#777', '#777')).toBe(1);
  });
});

describe('themes', () => {
  it('converts a theme to a VLT style definition', () => {
    const green = DEFAULT_COLOR_CONFIG.themes.find((t) => t.name === 'green');
    expect(toVltTheme(green)).toEqual({
      name: 'green',
      label: 'Green',
      style: {
        '--theme-color': 'var(--green)',
        '--theme-foreground-color': 'var(--white)',
        '--theme-high-contrast-color': 'var(--white)',
        '--theme-low-contrast-foreground-color': 'rgba(var(--white-rgb),0.7)',
      },
    });
  });
});

describe('per-block lists', () => {
  it('narrows colours in master-list order, or offers all', () => {
    expect(getBlockColors(config, 'contentRow').map((c) => c.name)).toEqual([
      'white',
      'gold',
    ]);
    expect(getBlockColors(config, 'juiziHero')).toHaveLength(8);
  });

  it('narrows themes and resolves the default', () => {
    expect(getBlockThemes(config, 'juiziCallout').map((t) => t.name)).toEqual([
      'green',
      'faded-blue',
    ]);
    expect(getBlockDefaultTheme(config, 'juiziCallout')).toBe('faded-blue');
    expect(getBlockDefaultTheme(config, 'other')).toBe('default');
  });
});

describe('editing', () => {
  it('renames a colour in themes and block lists', () => {
    const next = renameColor(config, 'white', 'paper');
    expect(next.colors[0].name).toBe('paper');
    expect(next.themes[0].background).toEqual({ color: 'paper' });
    expect(next.themes[1].muted).toEqual({ color: 'paper', opacity: 70 });
    expect(next.blocks.contentRow.colors).toEqual(['gold', 'paper']);
  });

  it('removes a colour and clears the theme slots that used it', () => {
    const next = removeColor(config, 'white');
    expect(next.colors).toHaveLength(7);
    expect(next.themes[0].background).toBeUndefined();
    expect(next.blocks.contentRow.colors).toEqual(['gold']);
    // The now-incomplete theme is reported.
    expect(validateColorConfig(next)).toContainEqual({
      code: 'themeSlotMissing',
      label: 'Default',
      index: 0,
      slot: 'background',
    });
  });

  it('removes a theme and its block references', () => {
    const next = removeTheme(config, 'faded-blue');
    expect(next.blocks.juiziCallout).toEqual({ themes: ['green'] });
  });

  it('builds unique, valid names from labels', () => {
    expect(slugifyName('Brand Orange')).toBe('brand-orange');
    expect(slugifyName('2 Tone')).toBe('tone');
    expect(slugifyName('Gold', ['gold'])).toBe('gold-2');
    expect(slugifyName('!!!')).toBe('colour');
  });

  it('expands short hex values for colour inputs', () => {
    expect(toColorInputValue('#ABC')).toBe('#aabbcc');
    expect(toColorInputValue('#11223344')).toBe('#112233');
    expect(toColorInputValue('nope')).toBe('#000000');
  });
});

describe('validateColorConfig', () => {
  it('accepts the defaults', () => {
    expect(validateColorConfig(DEFAULT_COLOR_CONFIG)).toEqual([]);
  });

  it('reports bad names, duplicates and colours', () => {
    const [first] = DEFAULT_COLOR_CONFIG.colors;
    const errors = validateColorConfig({
      ...DEFAULT_COLOR_CONFIG,
      colors: [
        ...DEFAULT_COLOR_CONFIG.colors,
        { ...first },
        { ...first, name: 'Bad', value: 'red' },
        { ...first, name: 'fg', foreground: 'blue' },
      ],
    });
    expect(errors.map((error) => error.code)).toEqual([
      'colorDuplicate',
      'colorName',
      'colorValue',
      'colorForeground',
    ]);
  });

  it('accepts theme names with capitals, not colour names', () => {
    // A site keeps the theme names its saved blocks use (plone.org).
    const [theme] = DEFAULT_COLOR_CONFIG.themes;
    const [color] = DEFAULT_COLOR_CONFIG.colors;
    expect(
      validateColorConfig({
        ...DEFAULT_COLOR_CONFIG,
        themes: [{ ...theme, name: 'MedBlue' }],
      }),
    ).toEqual([]);
    const errors = validateColorConfig({
      ...DEFAULT_COLOR_CONFIG,
      colors: [...DEFAULT_COLOR_CONFIG.colors, { ...color, name: 'MedBlue' }],
      themes: [{ ...theme, name: 'Med Blue' }],
    });
    expect(errors.map((error) => error.code)).toEqual([
      'colorName',
      'themeName',
    ]);
  });
});
