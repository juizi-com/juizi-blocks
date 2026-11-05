import {
  applyTransfer,
  buildTransferFile,
  DEFAULT_SETTINGS,
  missingGroups,
  readTransferFile,
  TRANSFER_FORMAT,
  transferFileName,
} from './index';

const colorConfig = {
  colors: [
    { name: 'white', label: 'White', value: '#ffffff', dark: false },
    { name: 'dark', label: 'Dark', value: '#111111', dark: true },
  ],
  themes: [
    {
      name: 'default',
      label: 'Default',
      background: { color: 'white' },
      foreground: { color: 'dark' },
      surface: { color: 'white' },
      muted: { color: 'dark', opacity: 60 },
    },
  ],
  blocks: { juiziHero: { themes: ['default'] } },
};

const settings = {
  disabled_blocks: ['juiziGallery'],
  enabled_blocks: ['hero'],
  block_groups: { juiziHero: ['editors'] },
  editor_language: 'fr',
  color_config: colorConfig,
  print_config: { ...DEFAULT_SETTINGS.print_config, paper_size: 'Letter' },
};

const now = new Date('2026-11-05T10:00:00Z');

const exported = () =>
  buildTransferFile(settings, {
    site: 'https://plone.org',
    addonVersion: '1.0.0-beta.5',
    now,
  });

const asText = (data) => JSON.stringify(data);

describe('buildTransferFile', () => {
  it('holds every setting with where and when it came from', () => {
    expect(exported()).toEqual({
      format: TRANSFER_FORMAT,
      format_version: 1,
      exported: '2026-11-05T10:00:00.000Z',
      site: 'https://plone.org',
      addon_version: '1.0.0-beta.5',
      settings,
    });
  });

  it('leaves out anything else the settings carry', () => {
    const file = buildTransferFile(
      { ...settings, '@id': 'https://plone.org/@juizi-blocks-settings' },
      { site: '', addonVersion: '' },
    );
    expect(file.settings).not.toHaveProperty('@id');
  });
});

describe('transferFileName', () => {
  it('names the site and the day', () => {
    expect(transferFileName('https://dev.plone.org', now)).toBe(
      'juizi-blocks-settings-dev.plone.org-2026-11-05.json',
    );
    expect(transferFileName('http://localhost:8080/Plone', now)).toBe(
      'juizi-blocks-settings-localhost-8080-2026-11-05.json',
    );
  });

  it('leaves the site out when it is not an address', () => {
    expect(transferFileName('', now)).toBe(
      'juizi-blocks-settings-2026-11-05.json',
    );
  });
});

describe('readTransferFile', () => {
  it('reads back an exported file with every part', () => {
    const result = readTransferFile(asText(exported()));
    expect(result.ok).toBe(true);
    expect(result.parts).toEqual(['blocks', 'language', 'colors', 'print']);
    expect(result.invalid).toEqual([]);
    expect(result.file.settings).toEqual(settings);
  });

  it('refuses text that is not JSON', () => {
    expect(readTransferFile('{oops')).toEqual({
      ok: false,
      problem: { code: 'notJson' },
    });
  });

  it.each([
    ['another JSON file', { name: 'package', version: '1.0.0' }],
    ['a list', [1, 2]],
    ['no settings', { format: TRANSFER_FORMAT, format_version: 1 }],
    [
      'no version',
      { format: TRANSFER_FORMAT, settings: { editor_language: 'fr' } },
    ],
  ])('refuses %s', (_, data) => {
    expect(readTransferFile(asText(data))).toEqual({
      ok: false,
      problem: { code: 'notOurs' },
    });
  });

  it('refuses a file from a newer format', () => {
    expect(
      readTransferFile(asText({ ...exported(), format_version: 2 })),
    ).toEqual({ ok: false, problem: { code: 'newerFormat', version: 2 } });
  });

  it('offers only the parts the file has', () => {
    const file = { ...exported(), settings: { editor_language: 'pt' } };
    const result = readTransferFile(asText(file));
    expect(result.parts).toEqual(['language']);
    expect(result.invalid).toEqual([]);
  });

  it('holds back colours that fail the dashboard checks', () => {
    const broken = {
      ...colorConfig,
      themes: [{ ...colorConfig.themes[0], foreground: { color: 'gone' } }],
    };
    const file = {
      ...exported(),
      settings: { ...settings, color_config: broken },
    };
    const result = readTransferFile(asText(file));
    expect(result.parts).toEqual(['blocks', 'language', 'print']);
    expect(result.invalid).toEqual(['colors']);
  });

  it('holds back block lists of the wrong shape', () => {
    const file = {
      ...exported(),
      settings: { ...settings, block_groups: { juiziHero: 'editors' } },
    };
    expect(readTransferFile(asText(file)).invalid).toEqual(['blocks']);
  });
});

describe('applyTransfer', () => {
  const draft = { ...DEFAULT_SETTINGS, editor_language: 'af' };

  it('replaces only the chosen parts', () => {
    const next = applyTransfer(draft, exported(), ['colors']);
    expect(next.color_config).toEqual(colorConfig);
    expect(next.editor_language).toBe('af');
    expect(next.disabled_blocks).toEqual([]);
    expect(next.print_config).toBe(draft.print_config);
  });

  it('brings the block switches and groups together', () => {
    const next = applyTransfer(draft, exported(), ['blocks']);
    expect(next.disabled_blocks).toEqual(['juiziGallery']);
    expect(next.enabled_blocks).toEqual(['hero']);
    expect(next.block_groups).toEqual({ juiziHero: ['editors'] });
  });

  it('switches off a block the file has both on and off', () => {
    const file = {
      ...exported(),
      settings: {
        ...settings,
        disabled_blocks: ['hero'],
        enabled_blocks: ['hero', 'listing'],
      },
    };
    expect(applyTransfer(draft, file, ['blocks']).enabled_blocks).toEqual([
      'listing',
    ]);
  });

  it('does not change the draft it is given', () => {
    const before = JSON.stringify(draft);
    applyTransfer(draft, exported(), ['blocks', 'language', 'colors']);
    expect(JSON.stringify(draft)).toBe(before);
  });
});

describe('missingGroups', () => {
  it('lists the groups the file limits blocks to that the site lacks', () => {
    const file = {
      ...exported(),
      settings: {
        ...settings,
        block_groups: { a: ['editors', 'writers'], b: ['authors', 'editors'] },
      },
    };
    expect(missingGroups(file, [{ id: 'editors' }])).toEqual([
      'authors',
      'writers',
    ]);
  });
});

describe('readTransferFile with damaged colours', () => {
  it.each([
    ['colours that are not a list', { colors: 'white', themes: [] }],
    ['themes that are not entries', { colors: [], themes: ['default'] }],
  ])('holds back %s', (_, color_config) => {
    const file = {
      ...exported(),
      settings: { ...settings, color_config },
    };
    expect(readTransferFile(asText(file)).invalid).toEqual(['colors']);
  });
});
