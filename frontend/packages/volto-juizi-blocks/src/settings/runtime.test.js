import config from '@plone/volto/registry';
import { DEFAULT_SETTINGS } from './constants';
import {
  MASTER_COLOR_LIST,
  getBlockColorList,
  getColorForeground,
  isBlockDisabled,
  isInstalled,
  registerJuiziBlocks,
  registerThemedBlocks,
  setInstalled,
  setRuntimeSettings,
} from './runtime';

describe('runtime settings', () => {
  beforeEach(() => {
    config.blocks = {
      ...config.blocks,
      themes: [],
      blocksConfig: { juiziCallout: { id: 'juiziCallout' } },
    };
    registerThemedBlocks(['juiziCallout']);
  });
  afterEach(() => setRuntimeSettings(DEFAULT_SETTINGS));

  it('updates MASTER_COLOR_LIST in place', () => {
    const reference = MASTER_COLOR_LIST;
    setRuntimeSettings({
      disabled_blocks: [],
      color_config: {
        ...DEFAULT_SETTINGS.color_config,
        colors: [{ name: 'ink', label: 'Ink', value: '#000', dark: true }],
      },
    });
    expect(reference).toBe(MASTER_COLOR_LIST);
    expect(MASTER_COLOR_LIST).toEqual([['var(--ink)', 'Ink', 'dark']]);
  });

  it('publishes the themes to VLT and narrows themed blocks', () => {
    setRuntimeSettings({
      disabled_blocks: ['contentRow'],
      color_config: {
        ...DEFAULT_SETTINGS.color_config,
        blocks: {
          juiziCallout: { themes: ['green'] },
          contentRow: { colors: ['gold'] },
        },
      },
    });
    expect(config.blocks.themes.map((t) => t.name)).toEqual([
      'default',
      'green',
      'faded-blue',
    ]);
    const callout = config.blocks.blocksConfig.juiziCallout;
    expect(callout.themes.map((t) => t.name)).toEqual(['green']);
    expect(callout.defaultTheme).toBe('green');
    expect(getBlockColorList('contentRow')).toEqual([
      ['var(--gold)', 'Gold', 'dark'],
    ]);
    expect(isBlockDisabled('contentRow')).toBe(true);
  });

  it('maps a stored colour to its text colour variable', () => {
    expect(getColorForeground('var(--green)')).toBe('var(--green-foreground)');
    expect(getColorForeground('transparent')).toBeUndefined();
  });
});

describe('before juizi.blocks is installed', () => {
  const siteThemes = [{ name: 'site', label: 'Site', style: {} }];
  const restricted = (blockType) =>
    config.blocks.blocksConfig[blockType].restricted({});

  beforeEach(() => {
    config.blocks = {
      ...config.blocks,
      themes: siteThemes,
      blocksConfig: {
        juiziCallout: { id: 'juiziCallout' },
        slate: { id: 'slate' },
      },
    };
    config.settings = { ...config.settings, controlpanels: [] };
    registerJuiziBlocks(['juiziCallout']);
    registerThemedBlocks(['juiziCallout']);
  });
  afterEach(() => setInstalled(false));

  it('keeps the Juizi blocks out of the chooser and the dashboard unlisted', () => {
    setInstalled(false);
    expect(isInstalled()).toBe(false);
    expect(restricted('juiziCallout')).toBe(true);
    expect(restricted('slate')).toBe(false);
    expect(config.settings.controlpanels).toEqual([]);
    expect(config.blocks.themes).toBe(siteThemes);
  });

  it('offers them and lists the dashboard once installed', () => {
    setInstalled(true);
    setRuntimeSettings(DEFAULT_SETTINGS);
    expect(restricted('juiziCallout')).toBe(false);
    expect(config.settings.controlpanels.map((p) => p['@id'])).toEqual([
      '/juizi-blocks',
    ]);
    expect(config.blocks.themes).not.toBe(siteThemes);
  });

  it("gives the site its own themes back when it's uninstalled", () => {
    setInstalled(true);
    setRuntimeSettings(DEFAULT_SETTINGS);
    setInstalled(false);
    expect(config.blocks.themes).toBe(siteThemes);
    expect(restricted('juiziCallout')).toBe(true);
    expect(config.settings.controlpanels).toEqual([]);
  });
});
