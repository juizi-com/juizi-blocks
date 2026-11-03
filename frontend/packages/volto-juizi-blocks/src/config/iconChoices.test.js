import { customSvgMap, getCustomSvg, getIconChoices } from './iconChoices';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const config = jest.requireMock('@plone/volto/registry');

afterEach(() => {
  delete config.settings.juiziBlocks;
});

const names = () => getIconChoices().map(([name]) => name);

describe('site icons', () => {
  it('offers only the built-in icons until the site adds its own', () => {
    expect(names()).toContain('Link');
    expect(names()).not.toContain('goal');
    expect(getCustomSvg('goal')).toBeUndefined();
  });

  it("adds the site's icons to the choices, named from their key", () => {
    const goal = { attributes: {}, content: '<path />' };
    config.settings.juiziBlocks = {
      icons: { goal, 'risk-alert': goal, ClientNote: goal },
    };
    expect(getIconChoices().slice(-3)).toEqual([
      ['goal', 'Goal'],
      ['risk-alert', 'Risk Alert'],
      ['ClientNote', 'Client Note'],
    ]);
    expect(getCustomSvg('goal')).toBe(goal);
  });

  it('lets a site icon replace a built-in SVG of the same name', () => {
    // The icons/ folder is read with require.context, which Jest lacks, so
    // stand in a built-in SVG.
    const builtIn = { attributes: {}, content: '<rect />' };
    const replacement = { attributes: {}, content: '<circle />' };
    customSvgMap.tech = builtIn;
    try {
      expect(getCustomSvg('tech')).toBe(builtIn);
      config.settings.juiziBlocks = { icons: { tech: replacement } };
      expect(getCustomSvg('tech')).toBe(replacement);
      expect(names().filter((name) => name === 'tech')).toHaveLength(1);
    } finally {
      delete customSvgMap.tech;
    }
  });
});
