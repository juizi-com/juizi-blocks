import { defineMessages } from 'react-intl';

// Carousel block: sidebar fields and the prompts editors see on the canvas.
export default defineMessages({
  slow: { id: 'juizi-carousel-slow', defaultMessage: 'Slow' },
  fast: { id: 'juizi-carousel-fast', defaultMessage: 'Fast' },
  tight: { id: 'juizi-carousel-tight', defaultMessage: 'Tight' },
  wide: { id: 'juizi-carousel-wide', defaultMessage: 'Wide' },
  shapeOriginal: {
    id: 'juizi-carousel-shape-original',
    defaultMessage: 'As uploaded',
  },
  shapeWide: { id: 'juizi-carousel-shape-wide', defaultMessage: 'Wide (16:9)' },
  shapeLandscape: {
    id: 'juizi-carousel-shape-landscape',
    defaultMessage: 'Landscape (3:2)',
  },
  shapeStandard: {
    id: 'juizi-carousel-shape-standard',
    defaultMessage: 'Standard (4:3)',
  },
  shapeSquare: {
    id: 'juizi-carousel-shape-square',
    defaultMessage: 'Square (1:1)',
  },
  shapePortrait: {
    id: 'juizi-carousel-shape-portrait',
    defaultMessage: 'Portrait (3:4)',
  },
  cardLayout: {
    id: 'juizi-carousel-card-layout',
    defaultMessage: 'Card layout',
  },
  behaviour: {
    id: 'juizi-carousel-behaviour',
    defaultMessage: 'Scrolling & behaviour',
  },
  navigation: { id: 'juizi-carousel-navigation', defaultMessage: 'Navigation' },
  logoStrip: { id: 'juizi-carousel-logo-strip', defaultMessage: 'Logo strip' },
  styleLogoHelp: {
    id: 'juizi-carousel-style-logo-help',
    defaultMessage:
      "Only each slide's picture is shown, as a logo. Give a slide a link to make its logo clickable.",
  },
  styleChangeHelp: {
    id: 'juizi-carousel-style-change-help',
    defaultMessage: 'Changing style may affect how content is presented.',
  },
  modeFull: {
    id: 'juizi-carousel-mode-full',
    defaultMessage: 'Image with text overlay',
  },
  modeImageOnly: {
    id: 'juizi-carousel-mode-image-only',
    defaultMessage: 'Image only',
  },
  modeImageTop: {
    id: 'juizi-carousel-mode-image-top',
    defaultMessage: 'Image above content',
  },
  modeReviews: {
    id: 'juizi-carousel-mode-reviews',
    defaultMessage: 'Reviews',
  },
  modeLogo: {
    id: 'juizi-carousel-mode-logo',
    defaultMessage: 'Scrolling logo strip',
  },
  startFull: {
    id: 'juizi-carousel-start-full',
    defaultMessage:
      'slides with the heading, text and button laid over the image',
  },
  startImageOnly: {
    id: 'juizi-carousel-start-image-only',
    defaultMessage: 'a clean image carousel with no text on the slides',
  },
  startImageTop: {
    id: 'juizi-carousel-start-image-top',
    defaultMessage:
      'card-style slides: image on top, heading, text and button below',
  },
  startReviews: {
    id: 'juizi-carousel-start-reviews',
    defaultMessage:
      'what people said about you, each with their name and an optional star rating',
  },
  startLogo: {
    id: 'juizi-carousel-start-logo',
    defaultMessage:
      'a continuously scrolling row of logos, e.g. partners or sponsors',
  },
  headingHelp: {
    id: 'juizi-carousel-heading-help',
    defaultMessage:
      'Optional heading shown above the carousel. Screen readers use it to name this section, so even a short heading helps.',
  },
  introHelp: {
    id: 'juizi-carousel-intro-help',
    defaultMessage: 'Optional text shown below the heading, above the carousel',
  },
  useListing: {
    id: 'juizi-carousel-use-listing',
    defaultMessage: 'Fill automatically from site content',
  },
  useListingHelp: {
    id: 'juizi-carousel-use-listing-help',
    defaultMessage:
      'Shows pages that match rules you set, instead of slides you add one by one.',
  },
  filterTags: {
    id: 'juizi-carousel-filter-tags',
    defaultMessage: 'Filter buttons by tag',
  },
  filterTagsHelp: {
    id: 'juizi-carousel-filter-tags-help',
    defaultMessage:
      "Tags, separated by commas, e.g. News, Events. Each tag becomes a button above the carousel, plus 'All'. Uses the tags set on each page.",
  },
  slides: { id: 'juizi-carousel-slides', defaultMessage: 'Slides' },
  slide: { id: 'juizi-carousel-slide', defaultMessage: 'Slide' },
  slideHeadingHelp: {
    id: 'juizi-carousel-slide-heading-help',
    defaultMessage:
      'Used as the slide heading, and to describe the slide and its picture to screen reader users. Always add a heading when the slide has a meaningful image.',
  },
  slideButtonHelp: {
    id: 'juizi-carousel-slide-button-help',
    defaultMessage: 'The button only shows when the slide has a link.',
  },
  buttonArrow: {
    id: 'juizi-carousel-button-arrow',
    defaultMessage: 'Show arrow on button',
  },
  buttonArrowHelp: {
    id: 'juizi-carousel-button-arrow-help',
    defaultMessage: "Adds a right arrow to this slide's button",
  },
  // Reviews style: the slide list becomes a list of reviews (named with
  // modeReviews above).
  review: { id: 'juizi-carousel-review', defaultMessage: 'Review' },
  reviewRating: {
    id: 'juizi-carousel-review-rating',
    defaultMessage: 'Star rating',
  },
  reviewRatingHelp: {
    id: 'juizi-carousel-review-rating-help',
    defaultMessage:
      'Optional. Choose "No stars" to show the review without a rating.',
  },
  noStars: { id: 'juizi-carousel-no-stars', defaultMessage: 'No stars' },
  stars: {
    id: 'juizi-carousel-stars',
    defaultMessage: '{count, plural, one {# star} other {# stars}}',
  },
  reviewText: {
    id: 'juizi-carousel-review-text',
    defaultMessage: 'Review text',
  },
  reviewTextHelp: {
    id: 'juizi-carousel-review-text-help',
    defaultMessage: 'What the person said, in their own words.',
  },
  reviewName: { id: 'juizi-carousel-review-name', defaultMessage: 'Name' },
  reviewNameHelp: {
    id: 'juizi-carousel-review-name-help',
    defaultMessage:
      'Who gave the review. When the review has a link, the name is what visitors click.',
  },
  reviewRole: {
    id: 'juizi-carousel-review-role',
    defaultMessage: 'Organisation or role',
  },
  reviewRoleHelp: {
    id: 'juizi-carousel-review-role-help',
    defaultMessage:
      'Optional, shown under the name. For example a company or a job title.',
  },
  reviewPicture: {
    id: 'juizi-carousel-review-picture',
    defaultMessage: 'Picture',
  },
  reviewPictureHelp: {
    id: 'juizi-carousel-review-picture-help',
    defaultMessage:
      'Optional photo of the person, or a logo, shown in a small circle. Screen readers skip it, because the name already says who it is.',
  },
  reviewLinkHelp: {
    id: 'juizi-carousel-review-link-help',
    defaultMessage:
      'Optional, for example the full review or the person’s website. Add a name too: the name becomes the link.',
  },
  reviewBackground: {
    id: 'juizi-carousel-review-background',
    defaultMessage: 'Review background colour',
  },
  reviewBackgroundHelp: {
    id: 'juizi-carousel-review-background-help',
    defaultMessage: 'Fills the background of each review',
  },
  clickableReviewsHelp: {
    id: 'juizi-carousel-clickable-reviews-help',
    defaultMessage:
      'Clicking anywhere on a review follows its link. Only reviews with both a link and a name become clickable.',
  },
  reviewLayout: {
    id: 'juizi-carousel-review-layout',
    defaultMessage: 'Review layout',
  },
  clickableReviews: {
    id: 'juizi-carousel-clickable-reviews',
    defaultMessage: 'Make entire review clickable',
  },
  equalHeightReviews: {
    id: 'juizi-carousel-equal-height-reviews',
    defaultMessage: 'Equal height reviews',
  },
  equalHeightReviewsHelp: {
    id: 'juizi-carousel-equal-height-reviews-help',
    defaultMessage: 'Stretches all reviews to match the tallest one in the row',
  },
  reviewsToShow: {
    id: 'juizi-carousel-reviews-to-show',
    defaultMessage: 'Reviews visible at once',
  },
  reviewsMobile: {
    id: 'juizi-carousel-reviews-mobile',
    defaultMessage: 'Reviews visible on mobile',
  },
  rated: {
    id: 'juizi-carousel-rated',
    defaultMessage: 'Rated {number} out of 5',
  },
  slideButtonStyle: {
    id: 'juizi-carousel-slide-button-style',
    defaultMessage: 'Slide button style',
  },
  textLink: {
    id: 'juizi-carousel-text-link',
    defaultMessage: 'Show as a text link',
  },
  textLinkHelpManual: {
    id: 'juizi-carousel-text-link-help-manual',
    defaultMessage:
      "Removes the button's background and padding, showing the chosen colour as a plain text link aligned with the slide content instead. Applies to slides you add yourself.",
  },
  textLinkHelpListing: {
    id: 'juizi-carousel-text-link-help-listing',
    defaultMessage:
      "Removes the button's background and padding, showing the chosen colour as a plain text link aligned with the slide content instead. Applies to every found page.",
  },
  showDate: { id: 'juizi-carousel-show-date', defaultMessage: 'Show date' },
  dateNone: {
    id: 'juizi-carousel-date-none',
    defaultMessage: "Don't show a date",
  },
  datePublication: {
    id: 'juizi-carousel-date-publication',
    defaultMessage: 'Publication date',
  },
  dateStart: {
    id: 'juizi-carousel-date-start',
    defaultMessage: 'Event start date (falls back to publication date)',
  },
  hideDescription: {
    id: 'juizi-carousel-hide-description',
    defaultMessage: 'Hide description',
  },
  hideButtons: {
    id: 'juizi-carousel-hide-buttons',
    defaultMessage: 'Hide "Read more" buttons',
  },
  hideImage: { id: 'juizi-carousel-hide-image', defaultMessage: 'Hide image' },
  hideImageHelp: {
    id: 'juizi-carousel-hide-image-help',
    defaultMessage:
      "Hides each card's image in the 'Image above content' layout, even when a slide has one set",
  },
  clickable: {
    id: 'juizi-carousel-clickable',
    defaultMessage: 'Make entire card clickable',
  },
  clickableHelp: {
    id: 'juizi-carousel-clickable-help',
    defaultMessage:
      'Clicking anywhere on the card follows the slide link. The slide heading is used as the link text for screen readers — add a heading to every slide when this is on.',
  },
  pictureShape: {
    id: 'juizi-carousel-picture-shape',
    defaultMessage: 'Picture shape',
  },
  pictureShapeHelp: {
    id: 'juizi-carousel-picture-shape-help',
    defaultMessage:
      'Gives every picture the same shape, trimming the edges to fit, so the slides line up. Try a few to see which suits your pictures.',
  },
  equalHeight: {
    id: 'juizi-carousel-equal-height',
    defaultMessage: 'Equal height cards',
  },
  equalHeightHelp: {
    id: 'juizi-carousel-equal-height-help',
    defaultMessage: 'Stretches all cards to match the tallest one in the row',
  },
  slidesToShow: {
    id: 'juizi-carousel-slides-to-show',
    defaultMessage: 'Cards visible at once',
  },
  largeScreens: {
    id: 'juizi-carousel-large-screens',
    defaultMessage: 'On large screens',
  },
  slidesMobile: {
    id: 'juizi-carousel-slides-mobile',
    defaultMessage: 'Cards visible on mobile',
  },
  phones: { id: 'juizi-carousel-phones', defaultMessage: 'On phones' },
  slideTime: {
    id: 'juizi-carousel-slide-time',
    defaultMessage: 'Time on each slide',
  },
  arrowPositionHelp: {
    id: 'juizi-carousel-arrow-position-help',
    defaultMessage:
      'On phones the arrows always sit below the carousel, whatever you choose here, so they are easy to reach with a thumb.',
  },
  arrowsSides: {
    id: 'juizi-carousel-arrows-sides',
    defaultMessage: 'On each side of the carousel',
  },
  belowCarousel: {
    id: 'juizi-carousel-below-carousel',
    defaultMessage: 'Below the carousel',
  },
  arrowsTop: {
    id: 'juizi-carousel-arrows-top',
    defaultMessage: 'Top right, beside the heading',
  },
  moreButtonPosition: {
    id: 'juizi-carousel-more-button-position',
    defaultMessage: '"More" button position',
  },
  moreButtonPositionHelp: {
    id: 'juizi-carousel-more-button-position-help',
    defaultMessage:
      'Where the optional "More" button appears. Independent of the arrow position.',
  },
  moreTop: {
    id: 'juizi-carousel-more-top',
    defaultMessage: 'Top, beside the heading',
  },
  moreButtonAlign: {
    id: 'juizi-carousel-more-button-align',
    defaultMessage: '"More" button alignment',
  },
  moreButtonAlignHelp: {
    id: 'juizi-carousel-more-button-align-help',
    defaultMessage:
      'Horizontal alignment when the button sits below the carousel dots',
  },
  moreButtonText: {
    id: 'juizi-carousel-more-button-text',
    defaultMessage: '"More" button text',
  },
  moreButtonTextHelp: {
    id: 'juizi-carousel-more-button-text-help',
    defaultMessage:
      'Optional button, e.g. "All news". Placed using "More" button position above.',
  },
  moreButtonLink: {
    id: 'juizi-carousel-more-button-link',
    defaultMessage: '"More" button link',
  },
  moreButtonStyle: {
    id: 'juizi-carousel-more-button-style',
    defaultMessage: '"More" button style',
  },
  arrowStyleHelp: {
    id: 'juizi-carousel-arrow-style-help',
    defaultMessage:
      'Standard: dark round arrows on the sides, outlined arrows above or below. Or pick a colour to match your buttons.',
  },
  listingButtonStyle: {
    id: 'juizi-carousel-listing-button-style',
    defaultMessage: 'Button style for found pages',
  },
  listingButtonStyleHelp: {
    id: 'juizi-carousel-listing-button-style-help',
    defaultMessage: "Style for the 'Read more' button on each found page",
  },
  hideDots: { id: 'juizi-carousel-hide-dots', defaultMessage: 'Hide dots' },
  backgroundImageHelp: {
    id: 'juizi-carousel-background-image-help',
    defaultMessage:
      'Optional image behind the whole block. Displayed at full cover, no overlay. Decorative: screen readers skip it.',
  },
  backgroundColorHelp: {
    id: 'juizi-carousel-background-color-help',
    defaultMessage:
      'Solid fill for the block. Text colour follows it automatically. If a background image is also set, the image is shown on top of this colour.',
  },
  textTone: {
    id: 'juizi-carousel-text-tone',
    defaultMessage: 'Text over the background image',
  },
  toneLight: {
    id: 'juizi-carousel-tone-light',
    defaultMessage: 'Light (for dark images)',
  },
  toneDark: {
    id: 'juizi-carousel-tone-dark',
    defaultMessage: 'Dark (for light images)',
  },
  slideBackground: {
    id: 'juizi-carousel-slide-background',
    defaultMessage: 'Slide background colour',
  },
  slideBackgroundHelp: {
    id: 'juizi-carousel-slide-background-help',
    defaultMessage: 'Fills the background of each slide',
  },
  scrollSpeed: {
    id: 'juizi-carousel-scroll-speed',
    defaultMessage: 'Scroll speed',
  },
  logoSize: { id: 'juizi-carousel-logo-size', defaultMessage: 'Logo size' },
  logoGap: {
    id: 'juizi-carousel-logo-gap',
    defaultMessage: 'Space between logos',
  },
  logoPadding: {
    id: 'juizi-carousel-logo-padding',
    defaultMessage: 'Space around each logo',
  },
  logoAlignment: {
    id: 'juizi-carousel-logo-alignment',
    defaultMessage: 'Logo alignment',
  },
  logoAlignmentHelp: {
    id: 'juizi-carousel-logo-alignment-help',
    defaultMessage:
      'Where the logos sit when they all fit across. Once there are more than fit, they scroll.',
  },
  pauseOnHover: {
    id: 'juizi-carousel-pause-on-hover',
    defaultMessage: 'Pause when hovered',
  },
  query: { id: 'juizi-carousel-query', defaultMessage: 'Which pages to show' },
  appendManual: {
    id: 'juizi-carousel-append-manual',
    defaultMessage: 'Also show slides I add myself',
  },
  appendManualHelp: {
    id: 'juizi-carousel-append-manual-help',
    defaultMessage: 'Your own slides come after the pages found.',
  },
  listingButtonTextHelp: {
    id: 'juizi-carousel-listing-button-text-help',
    defaultMessage: "Label for the 'Read more' button on each found page",
  },
  listingArrow: {
    id: 'juizi-carousel-listing-arrow',
    defaultMessage: 'Show arrow on buttons',
  },
  listingArrowHelp: {
    id: 'juizi-carousel-listing-arrow-help',
    defaultMessage:
      "Adds a right arrow to the 'Read more' button on every found page",
  },
  starts: { id: 'juizi-carousel-starts', defaultMessage: 'Starts {date}' },
  filterLabel: {
    id: 'juizi-carousel-filter-label',
    defaultMessage: 'Filter content',
  },
  show: { id: 'juizi-carousel-show', defaultMessage: 'Show:' },
  logoAlt: { id: 'juizi-carousel-logo-alt', defaultMessage: 'Logo' },
  emptyQuery: {
    id: 'juizi-carousel-empty-query',
    defaultMessage:
      'Your content query found nothing to show. Change its criteria in the sidebar.',
  },
  emptyManual: {
    id: 'juizi-carousel-empty-manual',
    defaultMessage:
      "No slides yet. Add slides in the sidebar under Slides, or switch on 'Fill automatically from site content' to fill it automatically.",
  },
  emptyReviews: {
    id: 'juizi-carousel-empty-reviews',
    defaultMessage: 'No reviews yet. Add reviews in the sidebar under Reviews.',
  },
  addReview: {
    id: 'juizi-carousel-add-review',
    defaultMessage: 'Add the review text and the name in the sidebar.',
  },
  reviewLinkNeedsName: {
    id: 'juizi-carousel-review-link-needs-name',
    defaultMessage:
      'This review has a link but no name, so visitors have nothing to click. Add a name in the sidebar.',
  },
  logosFit: {
    id: 'juizi-carousel-logos-fit',
    defaultMessage:
      'All the logos fit across, so the strip stays still. It scrolls once there are more logos than fit.',
  },
  reducedMotion: {
    id: 'juizi-carousel-reduced-motion',
    defaultMessage:
      "Your device is set to reduce motion, so the strip isn't moving for you. Visitors without that setting see it scroll.",
  },
  noTagResults: {
    id: 'juizi-carousel-no-tag-results',
    defaultMessage: 'No results tagged “{tag}”, so its button is hidden.',
  },
  addPicture: {
    id: 'juizi-carousel-add-picture',
    defaultMessage: 'Add a picture to this slide in the sidebar.',
  },
});
