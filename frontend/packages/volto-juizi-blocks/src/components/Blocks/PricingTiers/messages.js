import { defineMessages } from 'react-intl';

// Sidebar and canvas text for the Pricing tiers block. Shared words (Title,
// Background colour, Advanced…) come from _shared/messages.
export default defineMessages({
  // Panels
  tiers: { id: 'juizi-pricing-tiers', defaultMessage: 'Tiers' },
  tier: { id: 'juizi-pricing-tier', defaultMessage: 'Tier' },
  belowTiers: {
    id: 'juizi-pricing-below-tiers',
    defaultMessage: 'Below the tiers',
  },
  cards: { id: 'juizi-pricing-cards', defaultMessage: 'Card colours' },

  // Heading
  titleHelp: {
    id: 'juizi-pricing-title-help',
    defaultMessage: 'Optional. Shown above the tiers.',
  },
  descriptionHelp: {
    id: 'juizi-pricing-description-help',
    defaultMessage:
      'Optional. A short introduction under the title. You can add links and bold text.',
  },

  // Tiers panel
  tiersHelp: {
    id: 'juizi-pricing-tiers-help',
    defaultMessage:
      'Each tier is one card. Drag tiers to change their order. A tier needs a name before visitors see it.',
  },
  highlightedTier: {
    id: 'juizi-pricing-highlighted-tier',
    defaultMessage: 'Highlighted tier',
  },
  highlightedTierHelp: {
    id: 'juizi-pricing-highlighted-tier-help',
    defaultMessage:
      'Optional. This tier is drawn a little taller to stand out, for example your most chosen option. Give that tier its own card colour to make it stand out more.',
  },

  // Tier fields
  name: { id: 'juizi-pricing-name', defaultMessage: 'Tier name' },
  nameHelp: {
    id: 'juizi-pricing-name-help',
    defaultMessage: 'For example "Essential". Required.',
  },
  label: { id: 'juizi-pricing-label', defaultMessage: 'Tag' },
  labelHelp: {
    id: 'juizi-pricing-label-help',
    defaultMessage:
      'Optional. A short word or two shown with the name, for example "New" or "Most chosen".',
  },
  price: { id: 'juizi-pricing-price', defaultMessage: 'Price' },
  priceHelp: {
    id: 'juizi-pricing-price-help',
    defaultMessage:
      'Type it as it should appear, for example "R 49 450", "R 950 / year" or "Let\'s talk".',
  },
  priceNote: { id: 'juizi-pricing-price-note', defaultMessage: 'Price note' },
  priceNoteHelp: {
    id: 'juizi-pricing-price-note-help',
    defaultMessage:
      'Optional. Small text under the price, for example "incl. VAT" or "quoted per project".',
  },
  tierDescriptionHelp: {
    id: 'juizi-pricing-tier-description-help',
    defaultMessage: 'Optional. Who this tier is for, in a sentence or two.',
  },
  features: { id: 'juizi-pricing-features', defaultMessage: 'Features' },
  featuresHelp: {
    id: 'juizi-pricing-features-help',
    defaultMessage:
      "Optional. What's included, one feature per line. Shown as a plain list, without bullets.",
  },
  buttonTextHelp: {
    id: 'juizi-pricing-button-text-help',
    defaultMessage:
      'Optional. For example "Talk it through". The button needs a link too.',
  },
  buttonLink: {
    id: 'juizi-pricing-button-link',
    defaultMessage: 'Button link',
  },
  tierButtonStyleHelp: {
    id: 'juizi-pricing-tier-button-style-help',
    defaultMessage:
      'Leave empty to use the button style set for all tiers. On a tier with its own card colour, empty means a button that stands out against that colour.',
  },
  tierCardColor: {
    id: 'juizi-pricing-tier-card-color',
    defaultMessage: 'Card colour for this tier',
  },
  tierCardColorHelp: {
    id: 'juizi-pricing-tier-card-color-help',
    defaultMessage:
      'Leave empty to use the card colour set for all tiers. The text colour follows automatically.',
  },
  tierLabelColor: {
    id: 'juizi-pricing-tier-label-color',
    defaultMessage: 'Tag colour for this tier',
  },
  tierLabelColorHelp: {
    id: 'juizi-pricing-tier-label-color-help',
    defaultMessage: 'Leave empty to use the tag colour set for all tiers.',
  },

  // Below the tiers
  disclaimer: { id: 'juizi-pricing-disclaimer', defaultMessage: 'Small print' },
  disclaimerHelp: {
    id: 'juizi-pricing-disclaimer-help',
    defaultMessage:
      'Optional. Shown in small text under the tiers, for example what the prices include.',
  },

  // Card colours
  cardColor: { id: 'juizi-pricing-card-color', defaultMessage: 'Card colour' },
  cardColorHelp: {
    id: 'juizi-pricing-card-color-help',
    defaultMessage:
      'For all tiers. Leave empty for plain white cards. Each tier can have its own colour.',
  },
  plainCard: {
    id: 'juizi-pricing-plain-card',
    defaultMessage: 'Plain (white)',
  },
  labelColor: { id: 'juizi-pricing-label-color', defaultMessage: 'Tag colour' },
  labelColorHelp: {
    id: 'juizi-pricing-label-color-help',
    defaultMessage:
      'For all tags. Leave empty for the usual tag colour. Each tier can have its own.',
  },
  automatic: { id: 'juizi-pricing-automatic', defaultMessage: 'Automatic' },
  buttonStyleHelp: {
    id: 'juizi-pricing-button-style-help',
    defaultMessage:
      'For all tiers. Leave empty for an outlined button that stands out against each card. Each tier can have its own style.',
  },

  // Layout
  columns: {
    id: 'juizi-pricing-columns',
    defaultMessage: 'Cards in a row on large screens',
  },
  columnsHelp: {
    id: 'juizi-pricing-columns-help',
    defaultMessage:
      'Extra tiers start a new row. Smaller screens show two in a row, then one.',
  },
  backgroundColorHelp: {
    id: 'juizi-pricing-background-color-help',
    defaultMessage: 'The band behind the title and the cards.',
  },

  // On mobile
  mobileCarousel: {
    id: 'juizi-pricing-mobile-carousel',
    defaultMessage: 'Swipe through the tiers on phones',
  },
  mobileCarouselHelp: {
    id: 'juizi-pricing-mobile-carousel-help',
    defaultMessage:
      'On: one card at a time, with dots to show there are more. Off: the cards are stacked.',
  },
  startHighlighted: {
    id: 'juizi-pricing-start-highlighted',
    defaultMessage: 'Start on the highlighted tier',
  },
  startHighlightedHelp: {
    id: 'juizi-pricing-start-highlighted-help',
    defaultMessage:
      'Phones open on your highlighted tier instead of the first one. Autoplay is switched off, so visitors stay on it.',
  },
  arrows: { id: 'juizi-pricing-arrows', defaultMessage: 'Arrows' },
  arrowsHelp: {
    id: 'juizi-pricing-arrows-help',
    defaultMessage:
      'Optional. Buttons to go to the previous or next card. On each side, the card gets a little narrower so the arrows never cover it.',
  },
  arrowsAbove: {
    id: 'juizi-pricing-arrows-above',
    defaultMessage: 'Above the cards',
  },
  arrowsMiddle: {
    id: 'juizi-pricing-arrows-middle',
    defaultMessage: 'On each side, in the middle',
  },
  arrowsBelow: {
    id: 'juizi-pricing-arrows-below',
    defaultMessage: 'Below the cards',
  },
  arrowStyleHelp: {
    id: 'juizi-pricing-arrow-style-help',
    defaultMessage:
      'Standard: outlined in the text colour. Or pick a colour to match your buttons.',
  },
  showDots: {
    id: 'juizi-pricing-show-dots',
    defaultMessage: 'Show dots under the cards',
  },

  // Canvas
  start: {
    id: 'juizi-pricing-start',
    defaultMessage:
      'Add your first tier in the sidebar, under "Tiers". Each tier becomes a price card.',
  },
  addName: {
    id: 'juizi-pricing-add-name',
    defaultMessage:
      "Add a tier name. Visitors won't see this tier until it has one.",
  },
  addButtonText: {
    id: 'juizi-pricing-add-button-text',
    defaultMessage: 'Add button text',
  },
  carouselLabel: {
    id: 'juizi-pricing-carousel-label',
    defaultMessage: 'Pricing tiers',
  },
});
