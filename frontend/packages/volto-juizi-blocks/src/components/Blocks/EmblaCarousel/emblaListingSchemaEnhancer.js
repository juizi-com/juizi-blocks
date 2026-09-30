import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

export function emblaListingSchemaEnhancer(schema, formData = {}, intl) {
  const t = translator(intl);
  const modeSelected = !!formData?.displayMode;
  // Reviews are always added by hand (see schema-base.js): a carousel that
  // was filled from site content before switching to Reviews shows its own
  // list again.
  const useListing =
    !!formData?.useListing && formData?.displayMode !== 'reviews';

  // Work on the Content fieldset (id: 'default')
  const contentFieldset = schema?.fieldsets?.find((fs) => fs.id === 'default');
  const fields = contentFieldset?.fields || [];

  schema.properties = schema.properties || {};

  // Ensure useListing property exists
  if (!schema.properties.useListing) {
    schema.properties.useListing = {
      title: t(messages.useListing),
      description: t(messages.useListingHelp),
      type: 'boolean',
      default: false,
    };
  }

  // Listing-specific fields
  const listingFields = [
    'query',
    'appendManualSlides',
    'listingButtonText',
    'listingButtonStyle',
    'listingButtonLinkStyle',
    'listingButtonArrow',
  ];

  if (useListing && modeSelected) {
    // Inject listing fields into Content fieldset if not already there
    listingFields.forEach((f) => {
      if (!fields.includes(f)) {
        const idx = fields.indexOf('useListing');
        fields.splice(idx + 1, 0, f);
      }
    });

    schema.properties.query = schema.properties.query || {
      title: t(messages.query),
      widget: 'query',
    };
    schema.properties.appendManualSlides = schema.properties
      .appendManualSlides || {
      title: t(messages.appendManual),
      description: t(messages.appendManualHelp),
      type: 'boolean',
      default: false,
    };
    schema.properties.listingButtonText = schema.properties
      .listingButtonText || {
      title: t(shared.buttonText),
      description: t(messages.listingButtonTextHelp),
      type: 'string',
      // In the site's language: this text is what visitors read.
      default: t(shared.readMore),
    };
    schema.properties.listingButtonArrow = schema.properties
      .listingButtonArrow || {
      title: t(messages.listingArrow),
      description: t(messages.listingArrowHelp),
      type: 'boolean',
      default: false,
    };

    // Show slides field only if appendManualSlides is on
    if (formData?.appendManualSlides) {
      if (!fields.includes('slides')) fields.push('slides');
    } else {
      const idx = fields.indexOf('slides');
      if (idx !== -1) fields.splice(idx, 1);
    }
  } else {
    // Remove listing-only fields
    listingFields.forEach((f) => {
      const idx = fields.indexOf(f);
      if (idx !== -1) fields.splice(idx, 1);
    });

    // Only show manual slides field once a mode has been selected
    if (modeSelected && !fields.includes('slides')) {
      const idx = fields.indexOf('useListing');
      // Without the automatic fill switch (Reviews), the list comes last.
      if (idx === -1) fields.push('slides');
      else fields.splice(idx + 1, 0, 'slides');
    }

    // Remove slides if no mode selected yet
    if (!modeSelected) {
      const idx = fields.indexOf('slides');
      if (idx !== -1) fields.splice(idx, 1);
    }
  }

  return schema;
}
