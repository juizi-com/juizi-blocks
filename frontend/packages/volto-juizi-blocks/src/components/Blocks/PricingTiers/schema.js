import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../../config/colors';
import blockMessages from '../../../blocks/messages';
import { schemaData } from '../../BlockEdit/BlockEdit';
import { getPaddingChoices } from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

export const BLOCK_TYPE = 'pricingTiers';
export const COLUMN_CHOICES = [2, 3, 4, 5];
export const DEFAULT_COLUMNS = 4;

/** One tier (card), in the order it appears on the card. Its colours sit
 * last: they're overrides most tiers leave empty. */
const tierSchema = (t, colors) => {
  const colorChoices = getColorChoices(colors);
  return {
    title: t(messages.tier),
    addMessage: t(messages.tier),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: [
          'name',
          'label',
          'price',
          'priceNote',
          'description',
          'features',
          'buttonText',
          'buttonLink',
          'buttonStyle',
          'cardColor',
          'labelColor',
        ],
      },
    ],
    properties: {
      name: { title: t(messages.name), description: t(messages.nameHelp) },
      label: { title: t(messages.label), description: t(messages.labelHelp) },
      price: { title: t(messages.price), description: t(messages.priceHelp) },
      priceNote: {
        title: t(messages.priceNote),
        description: t(messages.priceNoteHelp),
      },
      description: {
        title: t(shared.description),
        description: t(messages.tierDescriptionHelp),
        widget: 'richtext',
      },
      features: {
        title: t(messages.features),
        description: t(messages.featuresHelp),
        widget: 'richtext',
      },
      buttonText: {
        title: t(shared.buttonText),
        description: t(messages.buttonTextHelp),
      },
      buttonLink: {
        title: t(messages.buttonLink),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
      },
      buttonStyle: {
        title: t(shared.buttonStyle),
        description: t(messages.tierButtonStyleHelp),
        choices: getButtonChoices(colors, t, { textLinks: true }),
      },
      cardColor: {
        title: t(messages.tierCardColor),
        description: t(messages.tierCardColorHelp),
        choices: colorChoices,
      },
      labelColor: {
        title: t(messages.tierLabelColor),
        description: t(messages.tierLabelColorHelp),
        choices: colorChoices,
      },
    },
    required: [],
  };
};

/**
 * Sidebar, in the order of the canvas: heading → tiers → small print → card
 * colours → layout → background → on mobile → advanced. No first choice:
 * the block does one thing, and an empty block asks for a first tier.
 *
 * Colour and button fields have no defaults: left empty, the view works
 * them out per card (a white card, a button that stands out against the
 * card's own colour), so changing a card colour never leaves a stored
 * button style behind that no longer fits.
 */
const pricingSchema = (args) => {
  const t = translator(args.intl);
  const data = schemaData(args);
  const colors = getBlockColorList(BLOCK_TYPE);
  const colorChoices = getColorChoices(colors);
  const tiers = Array.isArray(data.tiers) ? data.tiers.filter(Boolean) : [];
  const namedTiers = tiers.filter(
    (tier) => tier['@id'] && (tier.name || '').trim(),
  );
  const carouselOn = data.mobileCarousel !== false;
  // Only while the highlighted tier still exists (and has a name).
  const canStartHighlighted = namedTiers.some(
    (tier) => tier['@id'] === data.highlightedTier,
  );
  const startHighlighted = canStartHighlighted && !!data.mobileStartHighlighted;

  return {
    title: t(blockMessages.pricingTiers),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.heading),
        fields: ['title', 'description'],
      },
      {
        id: 'tiers',
        title: t(messages.tiers),
        fields: ['tiers', ...(namedTiers.length ? ['highlightedTier'] : [])],
      },
      {
        id: 'belowTiers',
        title: t(messages.belowTiers),
        fields: ['disclaimer'],
      },
      {
        id: 'cards',
        title: t(messages.cards),
        fields: ['cardColor', 'labelColor', 'buttonStyle'],
      },
      {
        id: 'layout',
        title: t(shared.layout),
        fields: ['columns'],
      },
      {
        id: 'background',
        title: t(shared.backgroundSpacing),
        fields: ['backgroundColor', 'paddingTop', 'paddingBottom'],
      },
      {
        id: 'mobile',
        title: t(shared.onMobile),
        fields: [
          'mobileCarousel',
          ...(carouselOn
            ? [
                ...(canStartHighlighted ? ['mobileStartHighlighted'] : []),
                // Starting on the highlighted tier keeps the carousel still.
                ...(startHighlighted ? [] : ['mobileAutoplay']),
                'mobileArrows',
                ...(data.mobileArrows ? ['mobileArrowStyle'] : []),
                'mobileDots',
              ]
            : []),
        ],
      },
      {
        id: 'advanced',
        title: t(shared.advanced),
        fields: ['customClass'],
      },
    ],
    properties: {
      title: { title: t(shared.title), description: t(messages.titleHelp) },
      description: {
        title: t(shared.description),
        description: t(messages.descriptionHelp),
        widget: 'richtext',
      },
      tiers: {
        title: t(messages.tiers),
        description: t(messages.tiersHelp),
        widget: 'object_list',
        schema: tierSchema(t, colors),
      },
      highlightedTier: {
        title: t(messages.highlightedTier),
        description: t(messages.highlightedTierHelp),
        choices: namedTiers.map((tier) => [tier['@id'], tier.name.trim()]),
        placeholder: t(shared.none),
      },
      disclaimer: {
        title: t(messages.disclaimer),
        description: t(messages.disclaimerHelp),
        widget: 'richtext',
      },
      cardColor: {
        title: t(messages.cardColor),
        description: t(messages.cardColorHelp),
        choices: colorChoices,
        placeholder: t(messages.plainCard),
      },
      labelColor: {
        title: t(messages.labelColor),
        description: t(messages.labelColorHelp),
        choices: colorChoices,
        placeholder: t(messages.automatic),
      },
      buttonStyle: {
        title: t(shared.buttonStyle),
        description: t(messages.buttonStyleHelp),
        choices: getButtonChoices(colors, t, { textLinks: true }),
        placeholder: t(messages.automatic),
      },
      columns: {
        title: t(messages.columns),
        description: t(messages.columnsHelp),
        choices: COLUMN_CHOICES.map((n) => [String(n), String(n)]),
        placeholder: String(DEFAULT_COLUMNS),
      },
      // 'None' is a real choice (not just the placeholder), so editors can
      // go back to no background.
      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(messages.backgroundColorHelp),
        choices: [['transparent', t(shared.none)], ...colorChoices],
        placeholder: t(shared.none),
      },
      paddingTop: {
        title: t(shared.topPadding),
        choices: getPaddingChoices(t),
        placeholder: t(shared.default),
      },
      paddingBottom: {
        title: t(shared.bottomPadding),
        choices: getPaddingChoices(t),
        placeholder: t(shared.default),
      },
      mobileCarousel: {
        title: t(messages.mobileCarousel),
        description: t(messages.mobileCarouselHelp),
        type: 'boolean',
      },
      mobileStartHighlighted: {
        title: t(messages.startHighlighted),
        description: t(messages.startHighlightedHelp),
        type: 'boolean',
      },
      mobileAutoplay: {
        title: t(shared.autoplay),
        description: t(shared.autoplayReducedMotion),
        type: 'boolean',
      },
      mobileArrows: {
        title: t(messages.arrows),
        description: t(messages.arrowsHelp),
        choices: [
          ['above', t(messages.arrowsAbove)],
          ['middle', t(messages.arrowsMiddle)],
          ['below', t(messages.arrowsBelow)],
        ],
        placeholder: t(shared.none),
      },
      mobileArrowStyle: {
        title: t(shared.arrowStyle),
        description: t(messages.arrowStyleHelp),
        choices: getButtonChoices(colors, t),
        placeholder: t(shared.standard),
      },
      mobileDots: { title: t(messages.showDots), type: 'boolean' },
      customClass: { title: t(shared.customClass) },
    },
    required: [],
  };
};

export default pricingSchema;
