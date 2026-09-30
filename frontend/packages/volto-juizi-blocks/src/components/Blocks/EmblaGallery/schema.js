import { schemaData } from '../../BlockEdit/BlockEdit';
import emblaGalleryBaseSchema from './schema-base';
import { emblaGallerySchemaEnhancer } from './emblaGallerySchemaEnhancer';

// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const emblaGallerySchema = (args = {}) => {
  const formData = schemaData(args);
  const base = emblaGalleryBaseSchema({ formData });
  return emblaGallerySchemaEnhancer({ ...base }, formData);
};

export default emblaGallerySchema;
