import { defineMessages } from 'react-intl';

// Gallery block: sidebar fields and the prompts editors see on the canvas.
export default defineMessages({
  gridLayout: {
    id: 'juizi-gallery-grid-layout',
    defaultMessage: 'Grid layout',
  },
  slideshowBehaviour: {
    id: 'juizi-gallery-slideshow-behaviour',
    defaultMessage: 'Slideshow behaviour',
  },
  enlargedView: {
    id: 'juizi-gallery-enlarged-view',
    defaultMessage: 'Enlarged view',
  },
  styleChangeHelp: {
    id: 'juizi-gallery-style-change-help',
    defaultMessage: 'Changing style may affect how the pictures are presented.',
  },
  modeSlideshow: {
    id: 'juizi-gallery-mode-slideshow',
    defaultMessage: 'Slideshow',
  },
  modeEven: { id: 'juizi-gallery-mode-even', defaultMessage: 'Even grid' },
  modeNatural: {
    id: 'juizi-gallery-mode-natural',
    defaultMessage: 'Natural grid',
  },
  startSlideshow: {
    id: 'juizi-gallery-start-slideshow',
    defaultMessage:
      'one large picture at a time, with small pictures underneath to click through',
  },
  startEven: {
    id: 'juizi-gallery-start-even',
    defaultMessage: 'pictures in neat rows, all cropped to the same size',
  },
  startNatural: {
    id: 'juizi-gallery-start-natural',
    defaultMessage: 'pictures keep their own shape and fit together in columns',
  },
  headingHelp: {
    id: 'juizi-gallery-heading-help',
    defaultMessage:
      'Optional heading shown above the gallery. Screen readers use it to name this section.',
  },
  source: {
    id: 'juizi-gallery-source',
    defaultMessage: 'Where the pictures come from',
  },
  sourceHelp: {
    id: 'juizi-gallery-source-help',
    defaultMessage:
      "'Pictures inside this page' shows the pictures stored in this page. 'Pictures from across the site' finds them using rules you set.",
  },
  sourceContext: {
    id: 'juizi-gallery-source-context',
    defaultMessage: 'Pictures inside this page',
  },
  sourceQuery: {
    id: 'juizi-gallery-source-query',
    defaultMessage: 'Pictures from across the site',
  },
  itemTypes: {
    id: 'juizi-gallery-item-types',
    defaultMessage: 'What counts as a picture',
  },
  typeImage: { id: 'juizi-gallery-type-image', defaultMessage: 'Pictures' },
  typeLink: {
    id: 'juizi-gallery-type-link',
    defaultMessage: 'Links that have a preview picture',
  },
  query: {
    id: 'juizi-gallery-query',
    defaultMessage: 'Which pictures to show',
  },
  slideshowStyle: {
    id: 'juizi-gallery-slideshow-style',
    defaultMessage: 'Slideshow style',
  },
  styleFeatured: {
    id: 'juizi-gallery-style-featured',
    defaultMessage: 'Large picture with small pictures below',
  },
  styleStrip: {
    id: 'juizi-gallery-style-strip',
    defaultMessage: 'Row of small pictures only',
  },
  columnsDesktop: {
    id: 'juizi-gallery-columns-desktop',
    defaultMessage: 'Columns on large screens',
  },
  columnsTablet: {
    id: 'juizi-gallery-columns-tablet',
    defaultMessage: 'Columns on tablets',
  },
  columnsTabletHelp: {
    id: 'juizi-gallery-columns-tablet-help',
    defaultMessage: 'Phones always show one column, so pictures stay in order.',
  },
  columnsMobile: {
    id: 'juizi-gallery-columns-mobile',
    defaultMessage: 'Columns on phones',
  },
  gap: { id: 'juizi-gallery-gap', defaultMessage: 'Space between pictures' },
  pictureTime: {
    id: 'juizi-gallery-picture-time',
    defaultMessage: 'Time on each picture',
  },
  hideArrowsHelp: {
    id: 'juizi-gallery-hide-arrows-help',
    defaultMessage:
      'The row of small pictures only shows arrows when there are more pictures than fit across.',
  },
  arrowPositionHelp: {
    id: 'juizi-gallery-arrow-position-help',
    defaultMessage:
      'On phones the arrows always sit below the pictures, whatever you choose here, so they are easy to reach with a thumb.',
  },
  arrowsSides: {
    id: 'juizi-gallery-arrows-sides',
    defaultMessage: 'On each side of the pictures',
  },
  arrowsBelow: {
    id: 'juizi-gallery-arrows-below',
    defaultMessage: 'Below the pictures',
  },
  rowAlignment: {
    id: 'juizi-gallery-row-alignment',
    defaultMessage: 'Small pictures alignment',
  },
  rowAlignmentHelp: {
    id: 'juizi-gallery-row-alignment-help',
    defaultMessage:
      'Where the row of small pictures sits when they all fit across. Once there are more than fit, they scroll from the left.',
  },
  thumbSize: {
    id: 'juizi-gallery-thumb-size',
    defaultMessage: 'Size of the small pictures',
  },
  highlight: {
    id: 'juizi-gallery-highlight',
    defaultMessage: 'Highlight around the current picture',
  },
  highlightHelp: {
    id: 'juizi-gallery-highlight-help',
    defaultMessage: 'Marks the small picture that matches the large one shown.',
  },
  whiteEarlier: {
    id: 'juizi-gallery-white-earlier',
    defaultMessage: 'White, earlier setting',
  },
  backgroundColorHelp: {
    id: 'juizi-gallery-background-color-help',
    defaultMessage: 'Text colour follows it automatically.',
  },
  arrowStyleHelp: {
    id: 'juizi-gallery-arrow-style-help',
    defaultMessage:
      'Standard: dark arrows over the pictures on the sides, outlined arrows below. Or pick a colour to match your buttons. Also used in the enlarged view.',
  },
  captionOnItem: {
    id: 'juizi-gallery-caption-on-item',
    defaultMessage: 'Show picture titles on the page',
  },
  captionOnItemHelp: {
    id: 'juizi-gallery-caption-on-item-help',
    defaultMessage:
      "Shows each picture's title on the small picture or grid picture itself",
  },
  enableLightbox: {
    id: 'juizi-gallery-enable-lightbox',
    defaultMessage: 'Enlarge pictures when clicked',
  },
  enableLightboxHelp: {
    id: 'juizi-gallery-enable-lightbox-help',
    defaultMessage:
      'When off, clicking a picture opens its own page in a new tab.',
  },
  captionInLightbox: {
    id: 'juizi-gallery-caption-in-lightbox',
    defaultMessage: 'Show picture titles in the enlarged view',
  },
  enlargeNamed: {
    id: 'juizi-gallery-enlarge-named',
    defaultMessage: 'Enlarge: {title}',
  },
  enlargeNumbered: {
    id: 'juizi-gallery-enlarge-numbered',
    defaultMessage: 'Enlarge picture {number} of {total}',
  },
  imageNumber: {
    id: 'juizi-gallery-image-number',
    defaultMessage: 'Image {number}',
  },
  counter: {
    id: 'juizi-gallery-counter',
    defaultMessage: '{current} of {total}',
  },
  noPictures: {
    id: 'juizi-gallery-no-pictures',
    defaultMessage:
      'No pictures found. Add some to this page, or choose a different image source in the sidebar.',
  },
});
