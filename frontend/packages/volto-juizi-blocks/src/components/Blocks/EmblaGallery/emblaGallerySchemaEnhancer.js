export function emblaGallerySchemaEnhancer(schema, formData = {}) {
  const modeSelected = !!formData?.displayMode;
  const sourceMode = formData?.sourceMode || 'context';

  const contentFieldset = schema?.fieldsets?.find((fs) => fs.id === 'default');
  const fields = contentFieldset?.fields || [];

  schema.properties = schema.properties || {};

  if (!modeSelected) return schema;

  const sourceIdx = fields.indexOf('sourceMode');

  if (sourceMode === 'query') {
    // Remove the context-only field
    const ctxIdx = fields.indexOf('contextItemTypes');
    if (ctxIdx !== -1) fields.splice(ctxIdx, 1);

    // Inject the query widget, as the Carousel does when filled from site
    // content
    if (!fields.includes('query')) {
      fields.splice(sourceIdx + 1, 0, 'query');
    }
    schema.properties.query = schema.properties.query || {
      title: 'Which pictures to show',
      widget: 'query',
    };
  } else {
    // Remove the query-only field
    const qIdx = fields.indexOf('query');
    if (qIdx !== -1) fields.splice(qIdx, 1);

    if (!fields.includes('contextItemTypes')) {
      fields.splice(sourceIdx + 1, 0, 'contextItemTypes');
    }
  }

  return schema;
}
