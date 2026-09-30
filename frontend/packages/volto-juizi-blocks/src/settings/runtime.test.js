import config from '@plone/volto/registry';
import { DEFAULT_SETTINGS } from './constants';
import {
  MASTER_COLOR_LIST,
  getBlockColorList,
  getColorForeground,
  isBlockDisabled,
  registerThemedBlocks,
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
