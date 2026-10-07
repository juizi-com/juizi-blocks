import { defineMessages } from 'react-intl';

// Content Row block: sidebar fields and the prompts editors see on the canvas.
export default defineMessages({
  linkOptional: {
    id: 'juizi-content-row-link-optional',
    defaultMessage: 'Link (optional)',
  },
  cardImageHelp: {
    id: 'juizi-content-row-card-image-help',
    defaultMessage:
      'The card heading is used as the image alt text. Add a heading to every card that has a meaningful image.',
  },
  cardBackground: {
    id: 'juizi-content-row-card-background',
    defaultMessage: 'Card background colour',
  },
  buttonTextHelp: {
    id: 'juizi-content-row-button-text-help',
    defaultMessage: 'The button only shows when the card has a link.',
  },
  item: { id: 'juizi-content-row-item', defaultMessage: 'Item' },
  items: { id: 'juizi-content-row-items', defaultMessage: 'Items' },
  statistic: { id: 'juizi-content-row-statistic', defaultMessage: 'Statistic' },
  statistics: {
    id: 'juizi-content-row-statistics',
    defaultMessage: 'Statistics',
  },
  card: { id: 'juizi-content-row-card', defaultMessage: 'Card' },
  numberCircle: {
    id: 'juizi-content-row-number-circle',
    defaultMessage: 'Number circle colour',
  },
  numberCircleHelp: {
    id: 'juizi-content-row-number-circle-help',
    defaultMessage:
      'Places the number inside a coloured circle. Leave as None to keep the plain number.',
  },
  itemBackground: {
    id: 'juizi-content-row-item-background',
    defaultMessage: 'Item background colour',
  },
  number: { id: 'juizi-content-row-number', defaultMessage: 'Number' },
  numberHelp: {
    id: 'juizi-content-row-number-help',
    defaultMessage: 'Counts up from 0 to this number.',
  },
  suffix: {
    id: 'juizi-content-row-suffix',
    defaultMessage: 'After the number (e.g. % or +)',
  },
  smallPrint: {
    id: 'juizi-content-row-small-print',
    defaultMessage: 'Small print',
  },
  iconCircle: {
    id: 'juizi-content-row-icon-circle',
    defaultMessage: 'Icon circle colour',
  },
  iconCircleHelp: {
    id: 'juizi-content-row-icon-circle-help',
    defaultMessage:
      'Places the icon inside a coloured circle. Leave as None to keep the plain icon.',
  },
  numberPosition: {
    id: 'juizi-content-row-number-position',
    defaultMessage: 'Number position',
  },
  iconPosition: {
    id: 'juizi-content-row-icon-position',
    defaultMessage: 'Icon position',
  },
  counting: { id: 'juizi-content-row-counting', defaultMessage: 'Counting' },
  cardLook: { id: 'juizi-content-row-card-look', defaultMessage: 'Card look' },
  speedQuick: {
    id: 'juizi-content-row-speed-quick',
    defaultMessage: 'Quick (1 second)',
  },
  speedNormal: {
    id: 'juizi-content-row-speed-normal',
    defaultMessage: 'Normal (2 seconds)',
  },
  speedSlow: {
    id: 'juizi-content-row-speed-slow',
    defaultMessage: 'Slow (3 seconds)',
  },
  backgroundSpacing: {
    id: 'juizi-content-row-background-spacing',
    defaultMessage: 'Background & spacing',
  },
  styleSwitchHelp: {
    id: 'juizi-content-row-style-switch-help',
    defaultMessage:
      'Switching style keeps your headings, text and links. Other fields may not carry over.',
  },
  modeNumbered: {
    id: 'juizi-content-row-mode-numbered',
    defaultMessage: 'Numbered',
  },
  modeCard: { id: 'juizi-content-row-mode-card', defaultMessage: 'Image card' },
  startNumbered: {
    id: 'juizi-content-row-start-numbered',
    defaultMessage: 'steps in order, each with a large number',
  },
  startIcon: {
    id: 'juizi-content-row-start-icon',
    defaultMessage: 'short points, each with an icon',
  },
  startStatistics: {
    id: 'juizi-content-row-start-statistics',
    defaultMessage: 'key figures that count up when they come into view',
  },
  startCard: {
    id: 'juizi-content-row-start-card',
    defaultMessage: 'cards with a picture, either behind the text or above it',
  },
  backgroundColorHelp: {
    id: 'juizi-content-row-background-color-help',
    defaultMessage:
      'The block background is always full width. Text colour updates automatically.',
  },
  backgroundImageHelp: {
    id: 'juizi-content-row-background-image-help',
    defaultMessage:
      'Shown behind the whole block, on top of the background colour. Decorative, so it needs no alt text. The text colour still follows the background colour: under a dark photo, pick a dark colour so the text turns light.',
  },
  backgroundPosition: {
    id: 'juizi-content-row-background-position',
    defaultMessage: 'Background position',
  },
  backgroundOverlay: {
    id: 'juizi-content-row-background-overlay',
    defaultMessage: 'Image overlay',
  },
  backgroundOverlayHelp: {
    id: 'juizi-content-row-background-overlay-help',
    defaultMessage:
      'A tint over the background image to keep text readable. Choose "None" for patterns and textures that already sit well behind text.',
  },
  preheaderHelp: {
    id: 'juizi-content-row-preheader-help',
    defaultMessage: 'Small text above the main heading.',
  },
  headingHelp: {
    id: 'juizi-content-row-heading-help',
    defaultMessage:
      'The main heading for this row. Screen readers use it to name this section, so even a short heading helps.',
  },
  descriptionHelp: {
    id: 'juizi-content-row-description-help',
    defaultMessage: 'Supporting text below the heading.',
  },
  blockImage: {
    id: 'juizi-content-row-block-image',
    defaultMessage: 'Block image',
  },
  blockImageHelp: {
    id: 'juizi-content-row-block-image-help',
    defaultMessage:
      'Optional image shown alongside the heading and description. The block heading is used to describe this image to screen reader users.',
  },
  blockImagePosition: {
    id: 'juizi-content-row-block-image-position',
    defaultMessage: 'Block image position',
  },
  belowDescription: {
    id: 'juizi-content-row-below-description',
    defaultMessage: 'Below description',
  },
  nextToDescription: {
    id: 'juizi-content-row-next-to-description',
    defaultMessage: 'Next to description',
  },
  headingAlignment: {
    id: 'juizi-content-row-heading-alignment',
    defaultMessage: 'Heading alignment',
  },
  itemsAlignment: {
    id: 'juizi-content-row-items-alignment',
    defaultMessage: 'Items alignment',
  },
  showViewAll: {
    id: 'juizi-content-row-show-view-all',
    defaultMessage: 'Show "View all" button',
  },
  viewAllLabel: {
    id: 'juizi-content-row-view-all-label',
    defaultMessage: '"View all" label',
  },
  viewAllLink: {
    id: 'juizi-content-row-view-all-link',
    defaultMessage: '"View all" link',
  },
  viewAllLinkHelp: {
    id: 'juizi-content-row-view-all-link-help',
    defaultMessage: "The button isn't shown to visitors until it has a link.",
  },
  viewAllStyle: {
    id: 'juizi-content-row-view-all-style',
    defaultMessage: '"View all" button style',
  },
  viewAllPosition: {
    id: 'juizi-content-row-view-all-position',
    defaultMessage: '"View all" button position',
  },
  viewAllPositionHelp: {
    id: 'juizi-content-row-view-all-position-help',
    defaultMessage: 'Where the "View all" button sits relative to the items.',
  },
  aboveItems: {
    id: 'juizi-content-row-above-items',
    defaultMessage: 'Above items (with heading)',
  },
  belowItems: {
    id: 'juizi-content-row-below-items',
    defaultMessage: 'Below items',
  },
  iconNumberPosition: {
    id: 'juizi-content-row-icon-number-position',
    defaultMessage: 'Icon/number position',
  },
  iconNumberPositionHelp: {
    id: 'juizi-content-row-icon-number-position-help',
    defaultMessage:
      'Where the icon or number sits relative to the heading and description.',
  },
  positionAbove: {
    id: 'juizi-content-row-position-above',
    defaultMessage: 'Above (default)',
  },
  positionLeft: {
    id: 'juizi-content-row-position-left',
    defaultMessage: 'Left of content',
  },
  positionInline: {
    id: 'juizi-content-row-position-inline',
    defaultMessage: 'To the right of the text',
  },
  shortenThousands: {
    id: 'juizi-content-row-shorten-thousands',
    defaultMessage: 'Shorten thousands (1 000 → 1k)',
  },
  countingSpeed: {
    id: 'juizi-content-row-counting-speed',
    defaultMessage: 'Counting speed',
  },
  countingSpeedHelp: {
    id: 'juizi-content-row-counting-speed-help',
    defaultMessage: 'How long the numbers take to count up.',
  },
  imageLayout: {
    id: 'juizi-content-row-image-layout',
    defaultMessage: 'Image layout',
  },
  imageBackground: {
    id: 'juizi-content-row-image-background',
    defaultMessage: 'Image as background with text overlay',
  },
  imageAbove: {
    id: 'juizi-content-row-image-above',
    defaultMessage: 'Image above content',
  },
  cardOverlay: {
    id: 'juizi-content-row-card-overlay',
    defaultMessage: 'Card image overlay',
  },
  cardOverlayHelp: {
    id: 'juizi-content-row-card-overlay-help',
    defaultMessage: 'Colour tint applied over all card background images.',
  },
  columns: {
    id: 'juizi-content-row-columns',
    defaultMessage: 'Columns on large screens',
  },
  columnsHelp: {
    id: 'juizi-content-row-columns-help',
    defaultMessage: 'Phones always show one column.',
  },
  sideBySide: {
    id: 'juizi-content-row-side-by-side',
    defaultMessage: 'Heading beside the items (large screens)',
  },
  sideBySideHelp: {
    id: 'juizi-content-row-side-by-side-help',
    defaultMessage:
      'Shows the heading and description next to the items, as two columns. Stacks to one column on phones.',
  },
  columnWidths: {
    id: 'juizi-content-row-column-widths',
    defaultMessage: 'Column widths (heading / items)',
  },
  ratio2575: {
    id: 'juizi-content-row-ratio2575',
    defaultMessage: 'Narrow heading (quarter / three quarters)',
  },
  ratio4060: {
    id: 'juizi-content-row-ratio4060',
    defaultMessage: 'Slightly narrow heading (40% / 60%)',
  },
  ratio5050: {
    id: 'juizi-content-row-ratio5050',
    defaultMessage: 'Equal (half / half)',
  },
  ratio6030: {
    id: 'juizi-content-row-ratio6030',
    defaultMessage: 'Wider heading (two thirds / one third)',
  },
  ratio7525: {
    id: 'juizi-content-row-ratio7525',
    defaultMessage: 'Wide heading (three quarters / quarter)',
  },
  columnAlignment: {
    id: 'juizi-content-row-column-alignment',
    defaultMessage: 'Column alignment',
  },
  columnAlignmentHelp: {
    id: 'juizi-content-row-column-alignment-help',
    defaultMessage:
      'Vertical alignment of the heading column against the items column when they end up different heights.',
  },
  mobileCarousel: {
    id: 'juizi-content-row-mobile-carousel',
    defaultMessage: 'Carousel on mobile',
  },
  mobileCarouselHelp: {
    id: 'juizi-content-row-mobile-carousel-help',
    defaultMessage: 'Items become a swipeable carousel on small screens.',
  },
  showDots: { id: 'juizi-content-row-show-dots', defaultMessage: 'Show dots' },
  carouselLabel: {
    id: 'juizi-content-row-carousel-label',
    defaultMessage: 'Content carousel',
  },
  noStatistics: {
    id: 'juizi-content-row-no-statistics',
    defaultMessage:
      'No statistics yet. Add your first statistic in the sidebar under Statistics.',
  },
  noItems: {
    id: 'juizi-content-row-no-items',
    defaultMessage:
      'No items yet. Add your first item in the sidebar under Items.',
  },
});
