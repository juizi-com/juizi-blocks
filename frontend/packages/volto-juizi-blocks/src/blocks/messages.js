import { defineMessages } from 'react-intl';

// Block names and descriptions. The id is the English text itself: Volto's
// block chooser looks a block's `title` up as a message id, and the Juizi
// Blocks dashboard does the same for titles and descriptions.
export default defineMessages({
  hero: { id: 'Hero', defaultMessage: 'Hero' },
  heroDescription: {
    id: 'Page header or themed section band with title, background image or video, and buttons.',
    defaultMessage:
      'Page header or themed section band with title, background image or video, and buttons.',
  },
  contentRow: { id: 'Content Row', defaultMessage: 'Content Row' },
  contentRowDescription: {
    id: 'Row of numbered steps, icons, statistics or image cards, with optional mobile carousel.',
    defaultMessage:
      'Row of numbered steps, icons, statistics or image cards, with optional mobile carousel.',
  },
  carousel: { id: 'Carousel', defaultMessage: 'Carousel' },
  carouselDescription: {
    id: 'Slides you add or pages found automatically, shown as a carousel, card row or scrolling logo strip.',
    defaultMessage:
      'Slides you add or pages found automatically, shown as a carousel, card row or scrolling logo strip.',
  },
  gallery: { id: 'Gallery', defaultMessage: 'Gallery' },
  galleryDescription: {
    id: 'Pictures from the page or across the site, as a slideshow, even grid or natural grid, with an optional enlarged view.',
    defaultMessage:
      'Pictures from the page or across the site, as a slideshow, even grid or natural grid, with an optional enlarged view.',
  },
  redirect: { id: 'Redirect', defaultMessage: 'Redirect' },
  redirectDescription: {
    id: 'Sends anonymous visitors to another page or URL. Editors are not redirected.',
    defaultMessage:
      'Sends anonymous visitors to another page or URL. Editors are not redirected.',
  },
  callout: { id: 'Callout', defaultMessage: 'Callout' },
  calloutDescription: {
    id: 'Highlighted message with an icon and an optional link.',
    defaultMessage: 'Highlighted message with an icon and an optional link.',
  },
});
