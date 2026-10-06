// `:languageDemo` makes this development site multilingual, in every
// language the add-on is translated into (see the add-on's src/index.ts).
//
// Volto Light Theme and the block add-ons below are this development site's
// choice, as on any site: volto-juizi-blocks needs Volto Light Theme but only
// adds its own blocks. Volto Light Theme comes after the block add-ons it
// adjusts, and before volto-juizi-blocks.
const addons = [
  '@plonegovbr/volto-social-media',
  '@eeacms/volto-accordion-block',
  '@kitconcept/volto-banner-block',
  '@kitconcept/volto-button-block',
  '@kitconcept/volto-carousel-block',
  '@kitconcept/volto-heading-block',
  '@kitconcept/volto-highlight-block',
  '@kitconcept/volto-introduction-block',
  '@kitconcept/volto-logos-block',
  '@kitconcept/volto-separator-block',
  '@kitconcept/volto-slider-block',
  '@kitconcept/volto-light-theme',
  'volto-juizi-blocks:languageDemo',
];
const theme = '@kitconcept/volto-light-theme';

module.exports = {
  addons,
  theme,
};
