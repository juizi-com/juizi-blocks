import installBlocks from './blocks';
import { setRuntimeSettings } from '../settings/runtime';
import { DEFAULT_SETTINGS } from '../settings/constants';

// Resolved through the add-on alias at build time; not resolvable by Jest.
jest.mock(
  '@kitconcept/volto-light-theme/components/Blocks/schema',
  () => ({
    defaultStylingSchema: ({ schema }) => ({
      ...schema,
      fieldsets: [...schema.fieldsets, { id: 'styling', fields: ['theme'] }],
      properties: { ...schema.properties, theme: { widget: 'color_picker' } },
    }),
  }),
  { virtual: true },
);

// A light manifest: the real one imports every block component (and with it
// most of Volto). The registration logic is what is tested here.
jest.mock('../blocks', () => ({
  juiziBlocks: [
    {
      id: 'emblaCarousel',
      title: 'Carousel',
      group: 'common',
      usesColors: true,
    },
    { id: 'juiziHero', title: 'Hero', restricted: () => true },
    {
      id: 'juiziCallout',
      title: 'Callout',
      usesThemes: true,
      isConfigured: (data) => !!data.calloutType,
      schemaEnhancer: ({ schema }) => ({ ...schema, enhanced: true }),
    },
  ],
}));

const makeConfig = () => ({
  blocks: {
    blocksConfig: {},
    groupBlocksOrder: [
      { id: 'mostUsed', title: 'Most used' },
      { id: 'text', title: 'Text' },
      { id: 'common', title: 'Common' },
    ],
  },
});

describe('Juizi block registration', () => {
  afterEach(() => setRuntimeSettings(DEFAULT_SETTINGS));

  it('registers every block under its id, keeping its own config', () => {
    const config = installBlocks(makeConfig());
    const { emblaCarousel, juiziHero } = config.blocks.blocksConfig;
    expect(Object.keys(config.blocks.blocksConfig)).toEqual([
      'emblaCarousel',
      'juiziHero',
      'juiziCallout',
    ]);
    // Juizi group by default; a definition can still choose its own group.
    expect(juiziHero.group).toBe('juizi');
    expect(juiziHero.mostUsed).toBe(false);
    expect(emblaCarousel.group).toBe('common');
    expect(emblaCarousel.usesColors).toBeUndefined();
  });

  it('adds a Juizi chooser group after "Most used", once', () => {
    const config = makeConfig();
    installBlocks(config);
    installBlocks(config);
    expect(config.blocks.groupBlocksOrder.map((g) => g.id)).toEqual([
      'mostUsed',
      'juizi',
      'text',
      'common',
    ]);
  });

  it("keeps a block's own restricted value for the dashboard to wrap", () => {
    const config = installBlocks(makeConfig());
    const { emblaCarousel, juiziHero } = config.blocks.blocksConfig;
    expect(emblaCarousel.restricted).toBeUndefined();
    expect(juiziHero.restricted()).toBe(true);
  });

  it("adds VLT's theme picker only to theme-aware blocks", () => {
    const config = installBlocks(makeConfig());
    const { juiziCallout, emblaCarousel } = config.blocks.blocksConfig;
    const result = juiziCallout.schemaEnhancer({
      schema: { fieldsets: [], properties: {} },
      formData: {},
    });
    expect(result.enhanced).toBe(true);
    expect(result.properties.theme).toEqual({ widget: 'color_picker' });
    expect(emblaCarousel.schemaEnhancer).toBeUndefined();
  });

  it('hides the Styling tab until the block is configured', () => {
    const config = installBlocks(makeConfig());
    const { juiziCallout } = config.blocks.blocksConfig;
    const tabs = (formData) =>
      juiziCallout
        .schemaEnhancer({ schema: { fieldsets: [], properties: {} }, formData })
        .fieldsets.map((f) => f.id);
    expect(tabs({})).toEqual([]);
    expect(tabs({ calloutType: 'tip' })).toEqual(['styling']);
  });
});
