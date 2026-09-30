export function emblaListingSchemaEnhancer(schema, formData = {}, intl) {
  const useListing = !!formData?.useListing;
  const modeSelected = !!formData?.displayMode;

  // Work on the Content fieldset (id: 'default')
  const contentFieldset = schema?.fieldsets?.find((fs) => fs.id === 'default');
  const fields = contentFieldset?.fields || [];

  schema.properties = schema.properties || {};

  // Ensure useListing property exists
  if (!schema.properties.useListing) {
    schema.properties.useListing = {
      title: 'Fill automatically from site content',
      description:
        'Shows pages that match rules you set, instead of slides you add one by one.',
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
      title: 'Which pages to show',
      widget: 'query',
    };
    schema.properties.appendManualSlides = schema.properties
      .appendManualSlides || {
      title: 'Also show slides I add myself',
      description: 'Your own slides come after the pages found.',
      type: 'boolean',
      default: false,
    };
    schema.properties.listingButtonText = schema.properties
      .listingButtonText || {
      title: 'Button text',
      description: "Label for the 'Read more' button on each found page",
      type: 'string',
      default: 'Read more',
    };
    schema.properties.listingButtonArrow = schema.properties
      .listingButtonArrow || {
      title: 'Show arrow on buttons',
      description:
        "Adds a right arrow to the 'Read more' button on every found page",
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
      fields.splice(idx + 1, 0, 'slides');
    }

    // Remove slides if no mode selected yet
    if (!modeSelected) {
      const idx = fields.indexOf('slides');
      if (idx !== -1) fields.splice(idx, 1);
    }
  }

  return schema;
}
