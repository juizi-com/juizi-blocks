import { convertLegacyBlock, repairCurrentBlock } from './blocks';
import { normalizeButtonStyle, normalizeColorValue } from './colors';
import { migrateLegacyBlocks } from './index';
import { setInstalled } from '../settings/runtime';
import {
  colorKeyToCssVar,
  getButtonClasses,
  getColorTextStyle,
  isColorDark,
} from '../config/colors';

// The conversion only runs on sites where juizi.blocks is installed.
beforeAll(() => setInstalled(true));
afterAll(() => setInstalled(false));

describe('before juizi.blocks is installed', () => {
  it('leaves content as saved', () => {
    setInstalled(false);
    const content = {
      blocks: { a: { '@type': 'buttonRow', title: 'Old' } },
    };
    expect(migrateLegacyBlocks(content).blocks.a).toEqual({
      '@type': 'buttonRow',
      title: 'Old',
    });
    setInstalled(true);
  });
});

describe('legacy colour values', () => {
  it('closes an unclosed var()', () => {
    expect(normalizeColorValue('var(--darkturquoise')).toBe(
      'var(--darkturquoise)',
    );
    expect(normalizeColorValue('var(--green)')).toBe('var(--green)');
    expect(normalizeColorValue('#ffffff')).toBe('#ffffff');
  });

  it('converts nithecs button styles', () => {
    expect(normalizeButtonStyle('white-outline')).toBe('outline__white');
    expect(normalizeButtonStyle('primary-filled')).toBe('solid__primary');
    expect(normalizeButtonStyle('solid__gold')).toBe('solid__gold');
    expect(normalizeButtonStyle('arrow')).toBe('arrow');
  });

  it('works out hex colours that are not in the list', () => {
    expect(isColorDark('#ffffff')).toBe(false);
    expect(isColorDark('#1b1b1b')).toBe(true);
    expect(getColorTextStyle('#1b1b1b')).toEqual({ color: '#ffffff' });
    expect(getColorTextStyle('var(--green')).toEqual({
      color: 'var(--green-foreground)',
    });
  });

  it('resolves button colours that are not in the list', () => {
    expect(colorKeyToCssVar('ffffff')).toBe('#ffffff');
    expect(colorKeyToCssVar('white')).toBe('var(--white)'); // in the defaults
    expect(colorKeyToCssVar('black')).toBe('black');
    expect(colorKeyToCssVar('coral')).toBe('var(--coral)');
    const { className, style } = getButtonClasses(
      'white-outline',
      'hero-button',
    );
    expect(className).toContain('btn-outline');
    expect(style['--btn-color']).toBe('var(--white)');
    expect(getButtonClasses('solid__ffffff').style['--btn-foreground']).toBe(
      '#111',
    );
  });
});

describe('legacy block conversion', () => {
  it('keeps the original data', () => {
    const old = { '@type': 'buttonRow', title: 'Hi', styles: { a: 1 } };
    const converted = convertLegacyBlock(old);
    expect(converted.legacyData).toEqual({ '@type': 'buttonRow', data: old });
    expect(converted.styles).toEqual({ a: 1 });
    // The original object is not modified.
    expect(old['@type']).toBe('buttonRow');
  });

  it('leaves current and unknown blocks alone', () => {
    const block = { '@type': 'slate', value: [] };
    expect(convertLegacyBlock(block)).toBe(block);
    expect(convertLegacyBlock(undefined)).toBeUndefined();
  });

  it('EmblaCarousel → emblaCarousel, filling displayMode from mode', () => {
    const converted = convertLegacyBlock({
      '@type': 'EmblaCarousel',
      mode: 'image-top',
      slides: [{ '@id': 's1', title: 'A' }],
      showEffectiveDate: true,
      imageTopCardColor: 'var(--lightgrey',
      slideButtonStyle: 'white-outline',
    });
    expect(converted).toMatchObject({
      '@type': 'emblaCarousel',
      displayMode: 'image-top',
      slides: [{ '@id': 's1', title: 'A' }],
      dateDisplay: 'effective',
      slideBackgroundColor: 'var(--lightgrey)',
      slideButtonStyle: 'outline__white',
    });
  });

  it('customHero → juiziHero (hero mode)', () => {
    const converted = convertLegacyBlock({
      '@type': 'customHero',
      preheader: 'Pre',
      title: 'Welcome',
      subtitle: 'Sub',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      foregroundColor: 'dark',
      topPaddingDesktop: 'compact',
      useTOC: true,
      buttons: [
        { id: 'b1', label: 'Go', link: [], buttonStyle: 'white-filled' },
      ],
      layoutMode: 'imageStackRight',
      decorativeImage1: [{ '@id': '/img' }],
    });
    expect(converted).toMatchObject({
      '@type': 'juiziHero',
      blockMode: 'hero',
      usePageTitle: false,
      usePageDescription: false,
      isPrimaryHeading: true,
      preheader: 'Pre',
      title: 'Welcome',
      subtitle: 'Sub',
      overlayStyle: 'black-50',
      paddingTop: 'compact',
      buttonsDisplayMode: 'toc',
      buttons: [{ '@id': 'b1', label: 'Go', buttonStyle: 'solid__white' }],
      sideImage: [{ '@id': '/img' }],
      customClass: 'hero-block--foreground-dark',
    });
  });

  it('customHero carousel mode uses the first carousel hero', () => {
    const converted = convertLegacyBlock({
      '@type': 'customHero',
      title: 'Hidden first hero',
      carouselEnabled: true,
      heroes: [{ title: 'Slide one' }, { title: 'Slide two' }],
    });
    expect(converted.title).toBe('Slide one');
    expect(converted.legacyData.data.heroes).toHaveLength(2);
  });

  it('buttonRow → juiziHero (section mode)', () => {
    const converted = convertLegacyBlock({
      '@type': 'buttonRow',
      preHeader: 'Pre',
      title: 'Title',
      text: 'Text',
      backgroundColor: 'none',
      buttonsPosition: 'beside',
      displayAsList: true,
      buttons: [{ title: 'x', label: 'One', link: [] }],
    });
    expect(converted).toMatchObject({
      '@type': 'juiziHero',
      blockMode: 'section',
      usePageTitle: false,
      preheader: 'Pre',
      title: 'Title',
      subtitle: 'Text',
      backgroundColor: 'transparent',
      horizontalLayout: true,
      buttonsDisplayMode: 'list',
      buttons: [{ '@id': 'legacy-button-0', label: 'One' }],
    });
    expect(
      convertLegacyBlock({
        '@type': 'buttonRow',
        useTOC: true,
        displayAsList: true,
      }).buttonsDisplayMode,
    ).toBe('toc');
  });

  it('multiCard → contentRow cards', () => {
    const converted = convertLegacyBlock({
      '@type': 'multiCard',
      headerText: 'Cards',
      blockBackgroundColor: 'var(--blue)',
      cardBackgroundColor: 'var(--lightblue)',
      imagePosition: 'above-content',
      mobileCarouselAutoplay: false,
      items: [
        {
          title: 'Card',
          description: 'Body',
          url: [{ '@id': '/x' }],
          linkText: 'More',
          buttonStyle: 'arrow',
        },
      ],
    });
    expect(converted).toMatchObject({
      '@type': 'contentRow',
      displayMode: 'card',
      headerText: 'Cards',
      backgroundColor: 'var(--blue)',
      imageCardStyle: 'above',
      mobileAutoplay: false,
      items: [
        {
          '@id': 'legacy-card-0',
          heading: 'Card',
          text: 'Body',
          link: [{ '@id': '/x' }],
          buttonText: 'More',
          backgroundColor: 'var(--lightblue)',
        },
      ],
    });
    // 'arrow' meant "the whole card is the link": no button style.
    expect(converted.items[0].buttonStyle).toBeUndefined();
  });

  it('multiCard with statistics → contentRow statistics', () => {
    const converted = convertLegacyBlock({
      '@type': 'multiCard',
      useStatistics: true,
      statistics: [{ value: 42, suffix: '%', label: 'Done' }],
    });
    expect(converted).toMatchObject({
      displayMode: 'statistics',
      items: [
        { '@id': 'legacy-stat-0', value: 42, suffix: '%', label: 'Done' },
      ],
    });
  });

  it('iconLinkRow → contentRow icons', () => {
    const converted = convertLegacyBlock({
      '@type': 'iconLinkRow',
      header: 'Links',
      backgroundColor: 'none',
      itemBackgroundColor: 'var(--grey)',
      items: [
        {
          icon: 'bell',
          heading: 'News',
          text: 'Latest',
          href: [{ '@id': '/n' }],
        },
        { icon: 'hourglass', text: 'Custom SVG' },
      ],
      showButton: true,
      buttonLabel: 'All',
      buttonStyle: 'solid__blue',
    });
    expect(converted).toMatchObject({
      '@type': 'contentRow',
      displayMode: 'icon',
      headerText: 'Links',
      backgroundColor: 'transparent',
      items: [
        {
          icon: 'BellRing',
          heading: 'News',
          link: [{ '@id': '/n' }],
          backgroundColor: 'var(--grey)',
        },
        { icon: 'hourglass', text: 'Custom SVG' },
      ],
      showViewAll: true,
      viewAllText: 'All',
      viewAllPosition: 'below',
      viewAllStyle: 'solid__blue',
    });
  });

  it('repairs current carousels saved with only `mode`', () => {
    expect(
      repairCurrentBlock({ '@type': 'emblaCarousel', mode: 'full' })
        .displayMode,
    ).toBe('full');
    const ok = { '@type': 'emblaCarousel', displayMode: 'full' };
    expect(repairCurrentBlock(ok)).toBe(ok);
  });

  it('repairs Content Rows saved with `variation` (renamed to displayMode)', () => {
    const saved = {
      '@type': 'contentRow',
      variation: 'card',
      items: [{ '@id': 'a', heading: 'One' }],
    };
    // Every style, including the fourth ('card'), which VLT's CSS hid.
    expect(repairCurrentBlock(saved)).toEqual({
      ...saved,
      displayMode: 'card',
    });
    const ok = { '@type': 'contentRow', displayMode: 'icon' };
    expect(repairCurrentBlock(ok)).toBe(ok);
  });

  it('plone.org hero → juiziHero, data unchanged', () => {
    const saved = {
      '@type': 'hero',
      blockMode: 'section',
      usePageTitle: false,
      title: 'Get involved',
      backgroundColor: 'var(--blue)',
      paddingTop: 'spacious',
      buttons: [{ '@id': 'b1', label: 'Join', buttonStyle: 'solid__white' }],
      styles: { theme: 'Blue' },
    };
    const converted = convertLegacyBlock(saved);
    const { '@type': _old, ...fields } = saved;
    expect(converted).toEqual({
      ...fields,
      '@type': 'juiziHero',
      legacyData: { '@type': 'hero', data: saved },
    });
    // The block and its legacyData don't share objects.
    expect(converted.buttons).not.toBe(converted.legacyData.data.buttons);
  });

  it("leaves other add-ons' hero blocks alone", () => {
    // e.g. @kitconcept/volto-hero-block, which has no blockMode.
    const other = { '@type': 'hero', title: 'Hi', buttonText: 'Go' };
    expect(convertLegacyBlock(other)).toBe(other);
    const unset = { '@type': 'hero' };
    expect(convertLegacyBlock(unset)).toBe(unset);
  });

  it('repairs Content Rows saved with `iconLeft` (now iconPosition)', () => {
    // plone.org's copy: `variation` and `iconLeft`; both repairs apply.
    const saved = { '@type': 'contentRow', variation: 'icon', iconLeft: true };
    expect(repairCurrentBlock(saved)).toEqual({
      ...saved,
      displayMode: 'icon',
      iconPosition: 'left',
    });
    const chosen = {
      '@type': 'contentRow',
      iconLeft: true,
      iconPosition: 'inline',
    };
    expect(repairCurrentBlock(chosen)).toBe(chosen);
    const off = { '@type': 'contentRow', displayMode: 'icon', iconLeft: false };
    expect(repairCurrentBlock(off)).toBe(off);
  });
});

describe('migrateLegacyBlocks (content transform)', () => {
  it('converts top-level and nested blocks in place', () => {
    const content = {
      blocks: {
        a: { '@type': 'iconLinkRow', items: [] },
        grid: {
          '@type': 'gridBlock',
          blocks: { b: { '@type': 'EmblaCarousel', mode: 'full' } },
        },
        c: { '@type': 'slate' },
        d: { '@type': 'contentRow', variation: 'statistics', items: [] },
        e: { '@type': 'hero', blockMode: 'hero' },
      },
    };
    migrateLegacyBlocks(content);
    expect(content.blocks.a['@type']).toBe('contentRow');
    expect(content.blocks.a.displayMode).toBe('icon');
    expect(content.blocks.grid.blocks.b['@type']).toBe('emblaCarousel');
    expect(content.blocks.c).toEqual({ '@type': 'slate' });
    // A Content Row saved before the rename keeps rendering its style.
    expect(content.blocks.d.displayMode).toBe('statistics');
    expect(content.blocks.e['@type']).toBe('juiziHero');
  });

  it('ignores content without blocks', () => {
    expect(migrateLegacyBlocks({ title: 'x' })).toEqual({ title: 'x' });
    expect(migrateLegacyBlocks(undefined)).toBeUndefined();
  });
});
