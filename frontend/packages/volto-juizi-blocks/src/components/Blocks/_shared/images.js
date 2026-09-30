/**
 * Image URL helpers for catalog results and object browser picks, shared by
 * the Carousel and Gallery (both read `searchContent` results).
 */
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

// Rank each named scale by its usable pixel dimension, so the best-fitting
// one for a target display size can be picked.
const scaleDimension = (s) => Math.max(s?.width || 0, s?.height || 0);

/**
 * Picks a scale from an image_scales entry. With a targetSize (px), the
 * smallest scale that still covers it at 2x (sharp on retina screens);
 * without one, a named mid-size scale, falling back to the largest.
 */
export const resolveScales = (scales, basePath, targetSize) => {
  try {
    if (!scales) return null;
    const candidates = Object.values(scales).filter((s) => s?.download);
    if (!candidates.length) return null;

    let scale;
    if (targetSize) {
      const needed = targetSize * 2;
      const fitting = candidates
        .filter((s) => scaleDimension(s) >= needed)
        .sort((a, b) => scaleDimension(a) - scaleDimension(b));
      scale =
        fitting[0] ||
        candidates.sort((a, b) => scaleDimension(b) - scaleDimension(a))[0];
    } else {
      scale =
        scales.preview ||
        scales.large ||
        scales.teaser ||
        scales.larger ||
        candidates.sort((a, b) => scaleDimension(b) - scaleDimension(a))[0];
    }

    if (!scale?.download) return null;
    const download = scale.download;
    if (download.startsWith('http') || download.startsWith('/'))
      return flattenToAppURL(download);
    return basePath ? `${basePath}/${download}` : null;
  } catch (e) {
    return null;
  }
};

/** Best image URL for a catalog brain or content object, or ''. */
export const getImageUrl = (item, targetSize) => {
  try {
    if (!item) return '';
    // image_scales + image_field: catalog brain format (Plone 6+). An array
    // is a linked preview image, an object the item's own image field.
    if (item.image_scales && item.image_field) {
      const fieldScales = item.image_scales[item.image_field];
      if (fieldScales) {
        if (Array.isArray(fieldScales) && fieldScales.length > 0) {
          const entry = fieldScales[0];
          const url = resolveScales(entry.scales, entry.base_path, targetSize);
          if (url) return url;
          if (entry.download && entry.base_path) {
            return `${entry.base_path}/${entry.download}`;
          }
        }
        if (!Array.isArray(fieldScales)) {
          const url = resolveScales(fieldScales, item['@id'], targetSize);
          if (url) return url;
        }
      }
      return `${item['@id']}/@@images/${item.image_field}`;
    }
    // preview_image_scales (separate linked preview field, older Plone)
    if (item.preview_image_scales && item.preview_image_field) {
      const fieldScales = item.preview_image_scales[item.preview_image_field];
      if (Array.isArray(fieldScales) && fieldScales.length > 0) {
        const entry = fieldScales[0];
        const url = resolveScales(entry.scales, entry.base_path, targetSize);
        if (url) return url;
      }
    }
    if (item.lead_image) {
      if (item.lead_image['@id'])
        return `${item.lead_image['@id']}/@@images/image`;
      const url = resolveScales(item.lead_image.scales, null);
      if (url) return url;
    }
    // Direct image field
    if (item.image) {
      const image = Array.isArray(item.image) ? item.image[0] : item.image;
      return image?.['@id']
        ? `${image['@id']}/@@images/image`
        : image?.download || '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

/** Image URL for a query result: Image items fall back to their own image. */
export const getListingImageUrl = (item, targetSize) => {
  if (!item) return '';
  if (item['@type'] === 'Image')
    return getImageUrl(item, targetSize) || `${item['@id']}/@@images/image`;
  return getImageUrl(item, targetSize);
};

/**
 * URL of the first image picked in an object browser image field, or ''.
 * `scale` adds a named scale (e.g. 'large').
 */
export const getPickedImageUrl = (image, scale) => {
  const item = Array.isArray(image) ? image[0] : image;
  if (!item) return '';
  if (item['@id']) {
    const base = `${flattenToAppURL(item['@id'])}/@@images/image`;
    return scale ? `${base}/${scale}` : base;
  }
  return item.download ? flattenToAppURL(item.download) : '';
};
