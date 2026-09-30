import { defineMessages } from 'react-intl';

// Hero block: sidebar fields and the prompts editors see on the canvas.
export default defineMessages({
  buttonLabelHelp: {
    id: 'juizi-hero-button-label-help',
    defaultMessage:
      "Leave empty to use the linked page's title. A button without a link isn't shown to visitors.",
  },
  buttonStyleHelp: {
    id: 'juizi-hero-button-style-help',
    defaultMessage:
      'Choose a style that contrasts with your background colour. On a dark background, use a light solid or outline — and vice versa.',
  },
  showArrow: { id: 'juizi-hero-show-arrow', defaultMessage: 'Show arrow icon' },
  showArrowHelp: {
    id: 'juizi-hero-show-arrow-help',
    defaultMessage:
      'Adds a small arrow after the label — useful for calls to action like "Learn more". Set per button, so some can have it and others not.',
  },
  sideImage: { id: 'juizi-hero-side-image', defaultMessage: 'Side image' },
  modeHelp: {
    id: 'juizi-hero-mode-help',
    defaultMessage:
      'Hero: a full-width page header. Section: a themed content band inside the page.',
  },
  chooseStyleContinue: {
    id: 'juizi-hero-choose-style-continue',
    defaultMessage: 'Choose a display style to continue.',
  },
  modeHero: {
    id: 'juizi-hero-mode-hero',
    defaultMessage: 'Hero (page header)',
  },
  modeSection: {
    id: 'juizi-hero-mode-section',
    defaultMessage: 'Section (content band)',
  },
  section: { id: 'juizi-hero-section', defaultMessage: 'Section' },
  startHero: {
    id: 'juizi-hero-start-hero',
    defaultMessage:
      'a full-width page header with title, description and background image',
  },
  startSection: {
    id: 'juizi-hero-start-section',
    defaultMessage:
      'a themed content band inside the page with background colour and buttons',
  },
  fullWidthHelp: {
    id: 'juizi-hero-full-width-help',
    defaultMessage: 'Stretch the background edge-to-edge beyond the container.',
  },
  primaryHeading: {
    id: 'juizi-hero-primary-heading',
    defaultMessage: 'This is the primary page heading',
  },
  primaryHeadingHelp: {
    id: 'juizi-hero-primary-heading-help',
    defaultMessage:
      'Makes this the main heading of the page. Use it for the first and most important block. Only one block per page should have this.',
  },
  hideTitle: {
    id: 'juizi-hero-hide-title',
    defaultMessage: 'Hide title visually',
  },
  hideTitleHelp: {
    id: 'juizi-hero-hide-title-help',
    defaultMessage:
      'Hides the title on screen while keeping it in the page structure for screen readers and search engines. Useful when the design does not need a visible heading but accessibility and SEO still require one.',
  },
  preheader: {
    id: 'juizi-hero-preheader',
    defaultMessage: 'Text above the title',
  },
  preheaderHelp: {
    id: 'juizi-hero-preheader-help',
    defaultMessage:
      'Small text displayed above the title. If set, this replaces the publication date or event details.',
  },
  titleHelp: {
    id: 'juizi-hero-title-help',
    defaultMessage:
      'The heading for this block. Even if you hide it visually, it helps screen readers and search engines understand what this section is about.',
  },
  subtitle: { id: 'juizi-hero-subtitle', defaultMessage: 'Subtitle' },
  subtitleHelp: {
    id: 'juizi-hero-subtitle-help',
    defaultMessage: 'Supporting text below the title.',
  },
  descriptionHelp: {
    id: 'juizi-hero-description-help',
    defaultMessage: 'Description text below the title.',
  },
  showBreadcrumbs: {
    id: 'juizi-hero-show-breadcrumbs',
    defaultMessage: 'Show breadcrumbs',
  },
  showBreadcrumbsHelp: {
    id: 'juizi-hero-show-breadcrumbs-help',
    defaultMessage:
      'Shows where this page sits in the site (for example Home / About) above the title. Hidden on top-level pages.',
  },
  logo: { id: 'juizi-hero-logo', defaultMessage: 'Logo' },
  logoHelp: {
    id: 'juizi-hero-logo-help',
    defaultMessage:
      'Optional logo displayed in the hero. Treated as decorative: screen readers skip it, so put anything important in the title.',
  },
  logoPosition: {
    id: 'juizi-hero-logo-position',
    defaultMessage: 'Logo position',
  },
  logoPositionLocked: {
    id: 'juizi-hero-logo-position-locked',
    defaultMessage:
      'Locked to "Above title" — the side slot is already in use by the Side image below.',
  },
  logoPositionHelp: {
    id: 'juizi-hero-logo-position-help',
    defaultMessage:
      'Choose where the logo sits. "Beside content" is unavailable once a Side image is added.',
  },
  aboveTitle: { id: 'juizi-hero-above-title', defaultMessage: 'Above title' },
  besideContent: {
    id: 'juizi-hero-beside-content',
    defaultMessage: 'Beside content (right)',
  },
  logoSize: { id: 'juizi-hero-logo-size', defaultMessage: 'Logo size' },
  sideImageHelp: {
    id: 'juizi-hero-side-image-help',
    defaultMessage:
      'A larger image displayed beside your text — not the Logo above. Works in both Hero and Section styles. Adding one moves the Logo (if any) to "Above title", since only one element can occupy the side slot.',
  },
  altText: { id: 'juizi-hero-alt-text', defaultMessage: 'Alt text' },
  altTextHelp: {
    id: 'juizi-hero-alt-text-help',
    defaultMessage:
      'Describes the image for screen reader users. Leave empty only if the image is purely decorative and adds no information beyond the text.',
  },
  verticalAlignment: {
    id: 'juizi-hero-vertical-alignment',
    defaultMessage: 'Vertical alignment',
  },
  verticalAlignmentHelp: {
    id: 'juizi-hero-vertical-alignment-help',
    defaultMessage:
      'Aligns the image against the height of the text content beside it.',
  },
  sideImageMobileHelp: {
    id: 'juizi-hero-side-image-mobile-help',
    defaultMessage:
      'Where the image appears on small screens, where it can no longer sit beside the text.',
  },
  belowContent: {
    id: 'juizi-hero-below-content',
    defaultMessage: 'Below content (default)',
  },
  aboveContent: {
    id: 'juizi-hero-above-content',
    defaultMessage: 'Above content',
  },
  hidden: { id: 'juizi-hero-hidden', defaultMessage: 'Hidden' },
  usePageTitle: {
    id: 'juizi-hero-use-page-title',
    defaultMessage: 'Use page title',
  },
  usePageTitleHelp: {
    id: 'juizi-hero-use-page-title-help',
    defaultMessage: 'Pulls the title from the page automatically.',
  },
  usePageDescription: {
    id: 'juizi-hero-use-page-description',
    defaultMessage: 'Use page description',
  },
  usePageDescriptionHelp: {
    id: 'juizi-hero-use-page-description-help',
    defaultMessage: 'Pulls the description from the page automatically.',
  },
  usePreviewImage: {
    id: 'juizi-hero-use-preview-image',
    defaultMessage: 'Use page preview image',
  },
  usePreviewImageHelp: {
    id: 'juizi-hero-use-preview-image-help',
    defaultMessage: 'Uses the page preview image as the hero background.',
  },
  showPublicationDate: {
    id: 'juizi-hero-show-publication-date',
    defaultMessage: 'Show publication date',
  },
  showPublicationDateHelp: {
    id: 'juizi-hero-show-publication-date-help',
    defaultMessage:
      "For news items — shows the publication date above the title. Only applies when the 'Text above the title' field is empty. If Show event details below is also on, event details take priority.",
  },
  showEventDetails: {
    id: 'juizi-hero-show-event-details',
    defaultMessage: 'Show event details',
  },
  showEventDetailsHelp: {
    id: 'juizi-hero-show-event-details-help',
    defaultMessage:
      'For events — shows the event date(s) and location above the title, e.g. "13 - 14 Nov 2024 | Cape Town". Only applies when the \'Text above the title\' field is empty and the item has a start date. Takes priority over Show publication date.',
  },
  backgroundImageHelp: {
    id: 'juizi-hero-background-image-help',
    defaultMessage:
      'Treated as a decorative image — no alt text is needed or used. Place meaningful content in the title and description fields above.',
  },
  backgroundVideo: {
    id: 'juizi-hero-background-video',
    defaultMessage: 'Background video',
  },
  backgroundVideoHelp: {
    id: 'juizi-hero-background-video-help',
    defaultMessage:
      'MP4 only. Autoplays, loops, stays muted. The video is automatically paused for visitors who have enabled reduced motion in their operating system settings.',
  },
  backgroundPosition: {
    id: 'juizi-hero-background-position',
    defaultMessage: 'Background position',
  },
  imageOverlay: {
    id: 'juizi-hero-image-overlay',
    defaultMessage: 'Image overlay',
  },
  imageOverlayHelp: {
    id: 'juizi-hero-image-overlay-help',
    defaultMessage:
      'Colour tint over the background image to keep text readable.',
  },
  backgroundColorImageHelp: {
    id: 'juizi-hero-background-color-image-help',
    defaultMessage:
      'The background image still shows on top of this colour, but the text colour follows the colour you pick here. If the text is hard to read on your image, try a different colour: a dark colour gives light text, a light colour gives dark text.',
  },
  backgroundColorHelp: {
    id: 'juizi-hero-background-color-help',
    defaultMessage:
      'Sets the block background. Text colour updates automatically based on your choice.',
  },
  buttonsDisplay: {
    id: 'juizi-hero-buttons-display',
    defaultMessage: 'Buttons display',
  },
  displayList: {
    id: 'juizi-hero-display-list',
    defaultMessage: 'Inline link list',
  },
  displayToc: {
    id: 'juizi-hero-display-toc',
    defaultMessage: 'Buttons to each heading on this page',
  },
  useH2: { id: 'juizi-hero-use-h2', defaultMessage: 'Include main headings' },
  useH3: { id: 'juizi-hero-use-h3', defaultMessage: 'Include sub-headings' },
  tocButtonStyleHelp: {
    id: 'juizi-hero-toc-button-style-help',
    defaultMessage:
      'Style applied to all the heading buttons. Choose a style that contrasts with your background.',
  },
  smallButtons: {
    id: 'juizi-hero-small-buttons',
    defaultMessage: 'Use smaller buttons',
  },
  sideBySide: {
    id: 'juizi-hero-side-by-side',
    defaultMessage: 'Side-by-side layout',
  },
  sideBySideHelp: {
    id: 'juizi-hero-side-by-side-help',
    defaultMessage: 'Display subtitle and buttons beside the title.',
  },
  tocEmpty: {
    id: 'juizi-hero-toc-empty',
    defaultMessage:
      "No headings on this page yet. Add some below and they'll appear here as buttons.",
  },
  addHeading: {
    id: 'juizi-hero-add-heading',
    defaultMessage: 'Add a heading in the sidebar.',
  },
  otherPrimary: {
    id: 'juizi-hero-other-primary',
    defaultMessage:
      "Another block is already the main heading for this page. Untick 'This is the primary page heading' on one of them.",
  },
  // Shown above the page's Title block in the editor (style.css).
  titleHiddenNote: {
    id: 'juizi-hero-title-hidden-note',
    defaultMessage:
      'This title is hidden on the page because a Hero block is set as the primary page heading. To show it again, untick “This is the primary page heading” in the Hero block’s Advanced settings.',
  },
});
