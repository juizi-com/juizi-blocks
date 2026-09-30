import { schemaData } from '../../BlockEdit/BlockEdit';
import emblaCarouselBaseSchema from './schema-base';
import { emblaListingSchemaEnhancer } from './emblaListingSchemaEnhancer';

// Called as ({ intl, props, data, formData }) by makeBlockEdit.
const emblaCarouselSchema = (args = {}) => {
  const formData = schemaData(args);
  const base = emblaCarouselBaseSchema({ formData, intl: args.intl });
  return emblaListingSchemaEnhancer({ ...base }, formData, args.intl);
};

export default emblaCarouselSchema;
