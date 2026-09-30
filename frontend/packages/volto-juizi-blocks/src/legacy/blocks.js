/**
 * Converts blocks saved by earlier Juizi block add-ons (the doi / jet /
 * nithecs generation) to the current block set.
 *
 * Runs as a Volto content transform (see legacy/index.js): every page load
 * converts old blocks in memory, so visitors see the current block and an
 * editor who saves writes the new format. Nothing changes in the database
 * until someone saves.
 *
 * Each converted block keeps the data it was converted from under
 * `legacyData` ({ '@type', data }), so no information is lost even where the
 * current block has no equivalent (e.g. CustomHero's multi-hero carousel).
 *
 * | Old @type        | Current @type   | Notes                                   |
 * |------------------|-----------------|-----------------------------------------|
 * | EmblaCarousel    | emblaCarousel   | same lineage; `mode` → `displayMode`    |
 * | customHero       | juiziHero       | hero mode; first hero only              |
 * | buttonRow        | juiziHero       | section mode with buttons / TOC / list  |
 * | multiCard        | contentRow      | card or statistics display style        |
 * | iconLinkRow      | contentRow      | icon display style                      |
 */
import { normalizeButtonStyle, normalizeColorValue } from './colors';

const hasItems = (value) => Array.isArray(value) && value.length > 0;
const clone = (value) => JSON.parse(JSON.stringify(value));
const pick = (source, keys) =>
  Object.fromEntries(
    keys.filter((key) => source[key] !== undefined).map((k) => [k, source[k]]),
  );

/** Background colour: 'none' / '' meant transparent in the old blocks. */
const background = (value) =>
  !value || value === 'none' ? 'transparent' : normalizeColorValue(value);

const OVERLAYS = {
  '': 'gradient',
  none: 'none',
  'rgba(0, 0, 0, 0.3)': 'black-30',
  'rgba(0, 0, 0, 0.5)': 'black-50',
  'rgba(0, 0, 0, 0.7)': 'black-70',
  'rgba(255, 255, 255, 0.3)': 'white-30',
  'rgba(255, 255, 255, 0.5)': 'white-50',
  'rgba(255, 255, 255, 0.7)': 'white-70',
  'rgba(var(--accent-color-rgb),0.3)': 'primary-30',
  'rgba(var(--accent-color-rgb),0.5)': 'primary-50',
  'rgba(var(--accent-color-rgb),0.7)': 'primary-70',
};

/** Volto icon names used by the old IconLinkRow → Lucide names used by the
 * Content Row. Unknown names (e.g. doi's custom SVGs) are kept: the Content
 * Row also resolves custom SVGs from its icons/ folder by file name. */
const ICONS = {
  link: 'Link',
  home: 'Home',
  folder: 'Folder',
  user: 'User',
  pencil: 'Pencil',
  briefcase: 'Briefcase',
  fingerprint: 'Fingerprint',
  bell: 'BellRing',
};

/** Stable ids for list items that had none: unique within their list and
 * the same on every load. */
const itemId = (item, prefix, index) =>
  item['@id'] || item.id || `legacy-${prefix}-${index}`;

const convertButtons = (buttons = []) =>
  (buttons || []).filter(Boolean).map((button, index) => ({
    '@id': itemId(button, 'button', index),
    label: button.label || button.title || '',
    link: button.link,
    ...(button.buttonStyle
      ? { buttonStyle: normalizeButtonStyle(button.buttonStyle) }
      : {}),
  }));

// ─── Converters: old data → current data (without '@type'/legacyData) ──────

function fromEmblaCarousel(old) {
  const data = { ...old };
  data.displayMode = old.displayMode || old.mode || 'full';
  if (old.showEffectiveDate && !old.dateDisplay) data.dateDisplay = 'effective';
  if (old.imageTopCardColor && !old.slideBackgroundColor) {
    data.slideBackgroundColor = normalizeColorValue(old.imageTopCardColor);
  }
  ['backgroundColor', 'slideBackgroundColor'].forEach((key) => {
    if (data[key]) data[key] = background(data[key]);
  });
  ['slideButtonStyle', 'listingButtonStyle', 'arrowStyle', 'headerLinkStyle']
    .filter((key) => data[key])
    .forEach((key) => {
      data[key] = normalizeButtonStyle(data[key]);
    });
  return data;
}

function fromCustomHero(old) {
  // Carousel mode showed only the additional heroes; otherwise the block's
  // own fields are the first hero. Only one hero can be converted.
  const hero =
    old.carouselEnabled && hasItems(old.heroes)
      ? { ...old, ...old.heroes[0] }
      : old;
  const layoutImage =
    old.layoutMode && old.layoutMode.startsWith('imageStack')
      ? old.decorativeImage1
      : undefined;
  return {
    blockMode: 'hero',
    // The old hero only used the page title/description when asked to.
    usePageTitle: !!old.usePageTitle,
    usePageDescription: !!old.usePageDescription,
    usePreviewImage: !!old.usePreviewImage,
    isPrimaryHeading: true,
    hideTitle: false,
    preheader: hero.preheader || '',
    title: hero.title || '',
    subtitle: hero.subtitle || '',
    ...pick(hero, [
      'heroLogo',
      'logoPosition',
      'logoSize',
      'backgroundImage',
      'backgroundVideo',
      'backgroundPosition',
      'horizontalLayout',
      'smallButtons',
      'showBreadcrumbs',
      'showPublicationDate',
      'useH2',
      'useH3',
      'isFullWidth',
    ]),
    alignment:
      hero.alignment || (old.layoutMode === 'center' ? 'center' : 'left'),
    overlayStyle: OVERLAYS[hero.backgroundColor || ''] || 'gradient',
    paddingTop: hero.topPaddingDesktop || 'default',
    paddingBottom: 'default',
    buttonsDisplayMode: old.useTOC ? 'toc' : 'buttons',
    buttons: convertButtons(hero.buttons),
    ...(layoutImage ? { sideImage: layoutImage } : {}),
    customClass: [
      old.customClass,
      old.customClasses,
      // The current hero always uses light text over its media; keep the
      // old "dark text" choice available to the stylesheet.
      hero.foregroundColor === 'dark' ? 'hero-block--foreground-dark' : '',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

function fromButtonRow(old) {
  return {
    blockMode: 'section',
    usePageTitle: false,
    usePageDescription: false,
    isPrimaryHeading: false,
    hideTitle: false,
    preheader: old.preHeader || old.preheader || '',
    title: old.title || '',
    subtitle: old.text || '',
    backgroundColor: background(old.backgroundColor),
    ...pick(old, [
      'backgroundImage',
      'isFullWidth',
      'smallButtons',
      'useH2',
      'useH3',
      'customClass',
    ]),
    alignment: old.alignment || 'left',
    horizontalLayout: old.buttonsPosition === 'beside',
    buttonsDisplayMode: old.useTOC
      ? 'toc'
      : old.displayAsList
        ? 'list'
        : 'buttons',
    buttons: convertButtons(old.buttons),
  };
}

function fromMultiCard(old) {
  const shared = {
    ...pick(old, [
      'preheaderText',
      'headerText',
      'descriptionText',
      'columns',
      'customClass',
      'showViewAll',
      'viewAllText',
      'viewAllUrl',
      'mobileCarousel',
      'statsFormatK',
      'statAnimationMs',
    ]),
    headerAlignment: old.headerAlignment || old.alignment || 'left',
    itemsAlignment: old.blockAlignment || old.alignment || 'left',
    backgroundColor: background(old.blockBackgroundColor),
    ...(old.viewAllStyle
      ? { viewAllStyle: normalizeButtonStyle(old.viewAllStyle) }
      : {}),
    ...(old.mobileCarouselAutoplay !== undefined
      ? { mobileAutoplay: old.mobileCarouselAutoplay }
      : {}),
    ...(old.mobileCarouselDots !== undefined
      ? { mobileDots: old.mobileCarouselDots }
      : {}),
  };

  if (old.useStatistics) {
    return {
      ...shared,
      displayMode: 'statistics',
      items: (old.statistics || []).filter(Boolean).map((stat, index) => ({
        '@id': itemId(stat, 'stat', index),
        title: stat.label || 'Statistic',
        ...pick(stat, ['value', 'suffix', 'label', 'extraInfo']),
        ...(stat.url ? { link: stat.url } : {}),
      })),
    };
  }

  const cardBackground = old.cardBackgroundColor
    ? background(old.cardBackgroundColor)
    : undefined;
  return {
    ...shared,
    displayMode: 'card',
    imageCardStyle:
      !old.imagePosition || old.imagePosition === 'background'
        ? 'overlay'
        : 'above',
    items: (old.items || []).filter(Boolean).map((card, index) => ({
      '@id': itemId(card, 'card', index),
      title: card.title || 'Card',
      heading: card.title || '',
      text: card.description || '',
      ...pick(card, ['image', 'preheader']),
      ...(card.url ? { link: card.url } : {}),
      ...(card.linkText ? { buttonText: card.linkText } : {}),
      // 'arrow' made the whole card the link; an empty style does that now.
      ...(card.buttonStyle && card.buttonStyle !== 'arrow'
        ? { buttonStyle: normalizeButtonStyle(card.buttonStyle) }
        : {}),
      ...(cardBackground ? { backgroundColor: cardBackground } : {}),
    })),
  };
}

function fromIconLinkRow(old) {
  const itemBackground =
    old.itemBackgroundColor && old.itemBackgroundColor !== 'none'
      ? background(old.itemBackgroundColor)
      : undefined;
  return {
    displayMode: 'icon',
    headerText: old.headerText || old.header || '',
    headerAlignment: old.headerAlignment || 'center',
    itemsAlignment: old.itemsAlignment || 'center',
    columns: old.columns || 4,
    backgroundColor: background(old.backgroundColor),
    ...pick(old, ['mobileCarousel', 'customClass']),
    items: (old.items || []).filter(Boolean).map((item, index) => ({
      '@id': itemId(item, 'item', index),
      title: item.heading || item.text || 'Item',
      icon: ICONS[item.icon] || item.icon || 'Link',
      heading: item.heading || '',
      text: item.text || '',
      ...(item.href ? { link: item.href } : {}),
      ...(itemBackground ? { backgroundColor: itemBackground } : {}),
    })),
    ...(old.showButton
      ? {
          showViewAll: true,
          viewAllText: old.buttonLabel || 'View all',
          viewAllUrl: old.buttonLink,
          viewAllPosition: 'below',
          ...(old.buttonStyle
            ? { viewAllStyle: normalizeButtonStyle(old.buttonStyle) }
            : {}),
        }
      : {}),
  };
}

export const LEGACY_BLOCKS = {
  EmblaCarousel: { type: 'emblaCarousel', convert: fromEmblaCarousel },
  customHero: { type: 'juiziHero', convert: fromCustomHero },
  buttonRow: { type: 'juiziHero', convert: fromButtonRow },
  multiCard: { type: 'contentRow', convert: fromMultiCard },
  iconLinkRow: { type: 'contentRow', convert: fromIconLinkRow },
};

/** Converts one block's data, or returns it unchanged if it isn't legacy. */
export function convertLegacyBlock(block) {
  const legacy = block && LEGACY_BLOCKS[block['@type']];
  if (!legacy) return block;
  const original = clone(block);
  const converted = legacy.convert(original);
  return {
    ...converted,
    '@type': legacy.type,
    // Keep Volto's own per-block keys (styles, theme, …).
    ...pick(block, ['styles', 'theme']),
    legacyData: { '@type': block['@type'], data: original },
  };
}

/**
 * Current blocks saved before a field was renamed or became required. The
 * old key is kept, so nothing is lost.
 * - Carousel: only renders once `displayMode` is set; older saves only had
 *   `mode`.
 * - Content Row: its style field was `variation` until VLT's CSS turned out
 *   to hide the fourth option of any field with that id ("Image card").
 */
export function repairCurrentBlock(block) {
  if (
    block?.['@type'] === 'emblaCarousel' &&
    !block.displayMode &&
    block.mode
  ) {
    return { ...block, displayMode: block.mode };
  }
  if (
    block?.['@type'] === 'contentRow' &&
    !block.displayMode &&
    block.variation
  ) {
    return { ...block, displayMode: block.variation };
  }
  return block;
}
