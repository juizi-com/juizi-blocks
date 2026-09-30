/* eslint-disable no-restricted-syntax */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import './gallery-base.css';
import './gallery.css';
import '../_shared/skeleton.css';
import {
  getButtonClasses,
  getColorTextStyle,
  getContrastingColor,
  getBlockColorList,
  isColorDark,
} from '../../../config/colors';
import Lightbox from './Lightbox';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import { isEditing } from '../_shared/editMode';
import { getHref as getLinkHref } from '../_shared/links';
import { getImageUrl, getListingImageUrl } from '../_shared/images';

// ─── Icons ──────────────────────────────────────────────────────────────
// Same plain-line-arrow convention as EmblaCarousel's NavArrowIcon — no
// icon-font dependency, aria-hidden since the button's own label carries
// the accessible name.
const NavArrowIcon = ({ direction }) => (
  <svg
    className="gallery__nav-arrow-icon"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={direction === 'left' ? 'M13 8H3M7 4L3 8l4 4' : 'M3 8h10M9 4l4 4-4 4'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────
const EmblaGallery = (blockProps) => {
  const { data, id, isEditMode } = blockProps;
  const dispatch = useDispatch();
  const contentId = useSelector((state) => state.content?.data?.['@id']);
  const contentPath = contentId ? flattenToAppURL(contentId) : null;

  const sourceMode = data.sourceMode || 'context';
  const contextSubId = `${id}-context`;
  const querySubId = `${id}-query`;

  const contextResults = useSelector(
    (state) => state.search?.subrequests?.[contextSubId],
  );
  const queryResults = useSelector(
    (state) => state.search?.subrequests?.[querySubId],
  );
  const allSubrequests = useSelector(
    (state) => state.search?.subrequests || {},
  );

  const metadataFields = useMemo(
    () => [
      'title',
      'description',
      'image_field',
      'image_scales',
      'preview_image_scales',
      'preview_image_field',
      'lead_image',
      'remoteUrl',
    ],
    [],
  );

  // ── Fetch: current item's contents ─────────────────────────────────────
  useEffect(() => {
    if (sourceMode !== 'context' || !contentPath) return;
    dispatch(
      searchContent(
        '',
        {
          path: contentPath,
          'path.depth': 1,
          portal_type:
            data.contextItemTypes?.length > 0
              ? data.contextItemTypes
              : ['Image', 'Link'],
          sort_on: 'getObjPositionInParent',
          metadata_fields: metadataFields,
          b_size: 999,
        },
        contextSubId,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode, contentPath, data.contextItemTypes, dispatch, contextSubId]);

  // ── Fetch: content query (mirrors EmblaCarousel's listing mode) ────────
  const [resolvedPaths, setResolvedPaths] = useState({});

  useEffect(() => {
    if (sourceMode !== 'query' || !data.query?.query) return;
    const uidCriteria = data.query.query.filter(
      (c) =>
        c.i === 'path' &&
        c.o === 'plone.app.querystring.operation.string.absolutePath',
    );
    uidCriteria.forEach((c) => {
      if (typeof c.v !== 'string') return;
      const uid = c.v.split('::')[0];
      if (resolvedPaths[uid]) return;
      const resolveId = `${id}-resolveuid-${uid}`;
      const result = allSubrequests[resolveId];
      if (result?.items?.length > 0) {
        const path = flattenToAppURL(result.items[0]['@id']);
        setResolvedPaths((prev) => ({ ...prev, [uid]: path }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSubrequests, sourceMode, data.query, id]);

  useEffect(() => {
    if (sourceMode !== 'query' || !data.query?.query) return;
    const uidCriteria = data.query.query.filter(
      (c) =>
        c.i === 'path' &&
        c.o === 'plone.app.querystring.operation.string.absolutePath',
    );
    if (!uidCriteria.length) return;

    const toResolve = uidCriteria
      .map((c) => (typeof c.v === 'string' ? c.v.split('::')[0] : null))
      .filter(Boolean)
      .filter((uid) => !resolvedPaths[uid]);

    if (!toResolve.length) return;

    toResolve.forEach((uid) => {
      const resolveId = `${id}-resolveuid-${uid}`;
      dispatch(
        searchContent(
          '',
          { UID: uid, metadata_fields: [], b_size: 1 },
          resolveId,
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode, data.query]);

  useEffect(() => {
    if (sourceMode !== 'query' || !data.query) return;

    let searchOptions;
    let searchTerm = '';

    if (typeof data.query === 'object' && data.query !== null) {
      if (data.query.query && Array.isArray(data.query.query)) {
        const transformedQuery = {};
        let pathPending = false;
        data.query.query.forEach((criterion) => {
          if (!criterion.i) return;
          if (
            criterion.i === 'path' &&
            criterion.o ===
              'plone.app.querystring.operation.string.absolutePath' &&
            typeof criterion.v === 'string'
          ) {
            const [uid, depthStr] = criterion.v.split('::');
            const resolvedPath = resolvedPaths[uid];
            if (!resolvedPath) {
              pathPending = true;
              return;
            }
            transformedQuery.path = resolvedPath;
            if (depthStr !== undefined) {
              transformedQuery['path.depth'] = parseInt(depthStr, 10);
            }
          } else {
            // Passed through as-is — EmblaCarousel's keyMap only covers
            // portal_type/Subject/review_state, which is also all a plain
            // image query typically needs.
            transformedQuery[criterion.i] = criterion.v;
          }
        });
        if (pathPending) return;
        if (data.query.sort_on) transformedQuery.sort_on = data.query.sort_on;
        if (data.query.sort_order)
          transformedQuery.sort_order = data.query.sort_order;
        if (data.query.limit)
          transformedQuery.b_size = parseInt(data.query.limit, 10);
        searchOptions = {
          ...transformedQuery,
          metadata_fields: metadataFields,
        };
      } else {
        searchOptions = { ...data.query, metadata_fields: metadataFields };
        if (data.query.limit)
          searchOptions.b_size = parseInt(data.query.limit, 10);
      }
    } else if (typeof data.query === 'string') {
      searchTerm = data.query;
      searchOptions = { metadata_fields: metadataFields };
    } else {
      searchOptions = { metadata_fields: metadataFields, query: data.query };
    }

    dispatch(searchContent(searchTerm, searchOptions, querySubId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode, data.query, resolvedPaths, dispatch, querySubId]);

  // ── Normalise results into gallery items ────────────────────────────────
  const convertItemToGalleryItem = useCallback(
    (item) => ({
      heading: item.title || '',
      content: item.description || '',
      link: item,
      '@id': item['@id'] || null,
      image_field: item.image_field || null,
      image_scales: item.image_scales || null,
      preview_image_scales: item.preview_image_scales || null,
      preview_image_field: item.preview_image_field || null,
      lead_image: item.lead_image || null,
    }),
    [],
  );

  const items = useMemo(() => {
    const raw =
      sourceMode === 'context'
        ? contextResults?.items || []
        : queryResults?.items || [];
    return raw.map(convertItemToGalleryItem);
  }, [sourceMode, contextResults, queryResults, convertItemToGalleryItem]);

  const imageFor = useCallback(
    (item, targetSize) =>
      getImageUrl(item, targetSize) ||
      getListingImageUrl(item.link, targetSize),
    [],
  );

  const getHref = useCallback((item) => getLinkHref(item?.link), []);

  // ── Lightbox state ───────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(null);

  const openLightbox = (index) => {
    if (data.enableLightbox ?? true) {
      setActiveIndex(index);
      return;
    }
    const href = getHref(items[index]);
    if (href) window.location.href = href;
  };
  const closeLightbox = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length,
    );
  const showNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));

  const lightboxItems = useMemo(
    () =>
      items.map((item) => ({
        heading: item.heading,
        imageUrl: imageFor(item, 1600),
      })),
    [items, imageFor],
  );

  // ── Colour / button styling — kept in step with EmblaCarousel ───────────
  const withContrastText = (parsed) => {
    const colorVal = parsed?.style?.['--btn-color'];
    if (!colorVal) return parsed;
    return {
      ...parsed,
      style: {
        ...parsed.style,
        // The colour's own text colour from the dashboard.
        '--btn-text':
          parsed.style['--btn-foreground'] ||
          (isColorDark(colorVal) ? '#fff' : '#111'),
      },
    };
  };
  const arrowStyleParsed = withContrastText(
    getButtonClasses(
      data.arrowStyle === 'default' ? '' : data.arrowStyle,
      'gallery__arrow-btn',
    ),
  );

  // ── Carousel (embla) — only rendered for displayMode 'carousel', but the
  // hooks themselves always mount (rules of hooks) ─────────────────────────
  const carouselStyle = data.carouselStyle || 'featured';
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plugins =
    data.autoplay && !reducedMotion
      ? [
          Autoplay({
            delay: parseInt(data.autoplayDelay, 10) || 8000,
            stopOnInteraction: false,
          }),
        ]
      : [];

  // Main viewport — the large featured image in 'featured' style. Unused
  // (but still mounted) in 'strip' style.
  const [viewportRef, embla] = useEmblaCarousel(
    { loop: data.loop ?? true, align: 'start' },
    plugins,
  );

  // Thumbnail strip — a carousel in its own right rather than a plain
  // overflow-x row, so it never shows a native scrollbar and matches the
  // main carousel's drag/snap feel. In 'featured' style it's driven by the
  // main carousel (click a thumb → main scrolls → strip follows). In
  // 'strip' style it IS the carousel — autoplay applies here instead.
  const [thumbViewportRef, thumbEmbla] = useEmblaCarousel(
    { containScroll: 'keepSnaps', dragFree: true, align: 'start' },
    carouselStyle === 'strip' ? plugins : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => {
      const idx = embla.selectedScrollSnap();
      setSelectedIndex(idx);
      thumbEmbla?.scrollTo(idx);
    };
    onSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    return () => {
      try {
        embla.off('select', onSelect);
      } catch (e) {}
      try {
        embla.off('reInit', onSelect);
      } catch (e) {}
    };
  }, [embla, thumbEmbla]);

  // Whether the row of small pictures is wider than the block. Only then
  // does the row-only style need arrows, and only when it fits does its
  // alignment apply (a scrolling row always starts at the left). Measured
  // again as each small picture loads: they have no width until then.
  const [thumbsOverflow, setThumbsOverflow] = useState(false);
  const measureThumbsRef = useRef(() => {});
  useEffect(() => {
    if (!thumbEmbla) return undefined;
    const measure = () => {
      const container = thumbEmbla.containerNode();
      const viewport = thumbEmbla.rootNode();
      setThumbsOverflow(container.scrollWidth > viewport.clientWidth + 1);
    };
    measureThumbsRef.current = measure;
    measure();
    thumbEmbla.on('reInit', measure);
    thumbEmbla.on('resize', measure);
    return () => {
      try {
        thumbEmbla.off('reInit', measure);
        thumbEmbla.off('resize', measure);
      } catch (e) {}
    };
  }, [thumbEmbla]);

  // Arrows: on each side of the pictures, or in a row below them. On phones
  // they are always in the row below (gallery.css), like the Carousel.
  const arrowPlacement = data.arrowPosition === 'below' ? 'below' : 'sides';
  const renderArrows = (api) => (
    <div className={`gallery__controls gallery__controls--${arrowPlacement}`}>
      <button
        type="button"
        className={`gallery__prev ${arrowStyleParsed.className}`}
        style={arrowStyleParsed.style}
        aria-label="Previous image"
        onClick={() => api && api.scrollPrev()}
      >
        <NavArrowIcon direction="left" />
      </button>
      <button
        type="button"
        className={`gallery__next ${arrowStyleParsed.className}`}
        style={arrowStyleParsed.style}
        aria-label="Next image"
        onClick={() => api && api.scrollNext()}
      >
        <NavArrowIcon direction="right" />
      </button>
    </div>
  );

  // ── Rendering helpers ─────────────────────────────────────────────────
  const displayMode = data.displayMode || 'blocks';
  const showNamesOnItem = !!data.showCaptionOnItem;
  const showNamesInLightbox = !!data.showCaptionInLightbox;

  // A picture opens the enlarged view through a real button; with the
  // enlarged view off, it's a real link to the picture's page.
  const enlarge = data.enableLightbox ?? true;
  const renderTrigger = (index, item, className, renderImage) => {
    if (enlarge) {
      return (
        <button
          type="button"
          className={`gallery__trigger ${className}`}
          aria-label={
            item.heading
              ? `Enlarge: ${item.heading}`
              : `Enlarge picture ${index + 1} of ${items.length}`
          }
          onClick={() => openLightbox(index)}
        >
          {/* The button's label names it, so the picture isn't read twice. */}
          {renderImage('')}
        </button>
      );
    }
    const href = getHref(item);
    return href ? (
      <UniversalLink href={href} className={`gallery__trigger ${className}`}>
        {renderImage(item.heading || '')}
      </UniversalLink>
    ) : (
      <div className={className}>{renderImage(item.heading || '')}</div>
    );
  };

  const slug = (data.title || 'gallery')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const blockId = `gallery-${slug}-${id?.slice ? id.slice(0, 6) : ''}`;
  const headingId = data.title ? `${blockId}-heading` : undefined;
  // Text colour follows the background colour.
  const hasBgColor =
    !!data.backgroundColor && data.backgroundColor !== 'transparent';
  const tone =
    hasBgColor && isColorDark(data.backgroundColor) ? 'light' : 'dark';
  const toneClass = `tone-${tone}`;

  // ── Loading and empty ─────────────────────────────────────────────────
  const activeResults =
    sourceMode === 'context' ? contextResults : queryResults;
  const sourceConfigured =
    sourceMode === 'context' ? !!contentPath : !!data.query;
  const loading =
    items.length === 0 &&
    sourceConfigured &&
    (!activeResults || activeResults.loading);
  // Nothing to show: visitors see nothing at all.
  const hideForVisitors = items.length === 0 && !loading && !isEditMode;

  const gridStyle = {
    '--cols-desktop': parseInt(data.columnsDesktop, 10) || 4,
    '--cols-tablet': parseInt(data.columnsTablet, 10) || 3,
    '--cols-mobile': parseInt(data.columnsMobile, 10) || 2,
    '--gallery-gap': `${parseInt(data.gap, 10) || 12}px`,
  };

  // Requested image resolution scales with the thumbnail height field so a
  // large "strip" thumbnail (or a bumped-up "featured" one) isn't served a
  // pre-baked 160px scale stretched past its native size.
  const thumbTargetSize = Math.max(
    160,
    (parseInt(data.thumbnailHeight, 10) || 90) * 2,
  );

  // The highlight around the current thumbnail: the chosen colour, or one
  // that contrasts with the background.
  const activeThumbColor =
    data.activeThumbColor ||
    getContrastingColor(
      data.backgroundColor,
      getBlockColorList('emblaGallery'),
    ) ||
    'currentColor';

  if (hideForVisitors) return null;

  const skeletonCount =
    displayMode === 'carousel'
      ? 6
      : (parseInt(data.columnsDesktop, 10) || 4) * 2;

  return (
    <BlockWrapper
      {...blockProps}
      className={`type-${displayMode} align-${data.alignment || 'left'} ${toneClass}`}
    >
      <section
        id={blockId}
        className={`gallery type-${displayMode} align-${data.alignment || 'left'} ${toneClass} ${data.isFullWidth ? 'full-width' : ''} ${data.outerClassName || ''}`}
        style={{
          backgroundColor: data.backgroundColor || 'transparent',
          ...getColorTextStyle(data.backgroundColor),
        }}
        aria-busy={loading || undefined}
        {...(headingId ? { 'aria-labelledby': headingId } : {})}
      >
        <div className="gallery__inner">
          {data.title ? (
            <h2 className="gallery__title" id={headingId}>
              {data.title}
            </h2>
          ) : null}
          {data.description ? (
            <p className="gallery__description">{data.description}</p>
          ) : null}

          {loading ? (
            // Skeleton in the chosen layout while the pictures load.
            <div aria-hidden="true">
              {displayMode === 'carousel' && carouselStyle === 'featured' && (
                <div className="block-skeleton__large" />
              )}
              <div
                className={`block-skeleton${displayMode === 'masonry' ? ' block-skeleton--mixed' : ''}`}
                style={{
                  '--block-skeleton-cols':
                    displayMode === 'carousel'
                      ? 6
                      : parseInt(data.columnsDesktop, 10) || 4,
                  '--block-skeleton-gap': `${parseInt(data.gap, 10) || 12}px`,
                  '--block-skeleton-height':
                    displayMode === 'carousel'
                      ? `${parseInt(data.thumbnailHeight, 10) || 90}px`
                      : '160px',
                  ...(displayMode === 'carousel' ? { marginTop: '12px' } : {}),
                }}
              >
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <div className="block-skeleton__tile" key={i} />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <BlockPlaceholder
              blockClass="gallery"
              prompt="No pictures found. Add some to this page, or choose a different image source in the sidebar."
            />
          ) : displayMode === 'carousel' ? (
            <div className="gallery__carousel">
              {carouselStyle === 'featured' && (
                <div className="gallery__featured-wrap">
                  <div className="gallery__viewport" ref={viewportRef}>
                    <div className="gallery__container">
                      {items.map((item, index) => (
                        <div
                          className="gallery__slide"
                          key={item['@id'] || index}
                        >
                          {renderTrigger(
                            index,
                            item,
                            'gallery__featured-image',
                            (alt) => (
                              <img
                                src={imageFor(item, 1200)}
                                alt={alt}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ),
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {!data.hideArrows && items.length > 1 && renderArrows(embla)}
                </div>
              )}

              <div
                className={`gallery__thumbs-wrap ${carouselStyle === 'strip' ? 'gallery__thumbs--standalone' : ''} ${thumbsOverflow ? '' : `gallery__thumbs--fits gallery__thumbs--align-${data.rowAlignment || 'left'}`}`}
                style={{
                  '--thumb-height': `${parseInt(data.thumbnailHeight, 10) || 90}px`,
                  '--thumb-active-color': activeThumbColor,
                }}
              >
                <div
                  className="gallery__thumbs-viewport"
                  ref={thumbViewportRef}
                >
                  <div className="gallery__thumbs-container">
                    {items.map((item, index) => (
                      <div
                        className="gallery__thumb-slide"
                        key={item['@id'] || index}
                      >
                        <button
                          type="button"
                          className={`gallery__thumb ${carouselStyle === 'featured' && index === selectedIndex ? 'is-active' : ''}`}
                          aria-label={item.heading || `Image ${index + 1}`}
                          onClick={() =>
                            carouselStyle === 'featured'
                              ? embla && embla.scrollTo(index)
                              : openLightbox(index)
                          }
                        >
                          <img
                            src={imageFor(item, thumbTargetSize)}
                            alt=""
                            onLoad={() => measureThumbsRef.current()}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {showNamesOnItem && item.heading && (
                            <span className="gallery__thumb-caption">
                              {item.heading}
                            </span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Row-only style: arrows only when the row doesn't fit */}
                {carouselStyle === 'strip' &&
                  !data.hideArrows &&
                  thumbsOverflow &&
                  renderArrows(thumbEmbla)}
              </div>
            </div>
          ) : (
            <div
              className={`gallery__grid gallery__grid--${displayMode} ${data.equalHeight && displayMode === 'blocks' ? 'equal-height' : ''}`}
              style={gridStyle}
            >
              {items.map((item, index) => (
                <div key={item['@id'] || index} className="gallery__grid-item">
                  {renderTrigger(
                    index,
                    item,
                    'gallery__grid-trigger',
                    (alt) => (
                      <>
                        <img
                          src={imageFor(item, 480)}
                          alt={alt}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {showNamesOnItem && item.heading && (
                          <span className="gallery__grid-caption">
                            {item.heading}
                          </span>
                        )}
                      </>
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Lightbox
          items={lightboxItems}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
          showCaption={showNamesInLightbox}
          arrowStyleParsed={arrowStyleParsed}
        />
      </section>
    </BlockWrapper>
  );
};

const GalleryPlaceholder = () => (
  <BlockPlaceholder
    blockClass="gallery"
    prompt="Select a display style in the sidebar to get started."
    modes={[
      {
        name: 'Slideshow',
        description:
          'one large picture at a time, with small pictures underneath to click through',
      },
      {
        name: 'Even grid',
        description: 'pictures in neat rows, all cropped to the same size',
      },
      {
        name: 'Natural grid',
        description:
          'pictures keep their own shape and fit together in columns',
      },
    ]}
  />
);

const WrappedEmblaGallery = (props) => {
  const { data } = props;
  // Hook-free outer wrapper: the gallery (and its hooks) only mounts once a
  // style is chosen. The start screen shows only in the editor.
  const isEditMode = isEditing(props);
  if (!data?.displayMode) {
    if (!isEditMode) return null;
    return (
      <BlockWrapper {...props}>
        <GalleryPlaceholder />
      </BlockWrapper>
    );
  }
  return (
    <BlockErrorBoundary
      blockClass="gallery"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(data)}
    >
      <EmblaGallery
        {...props}
        id={props.id || props.block}
        isEditMode={isEditMode}
      />
    </BlockErrorBoundary>
  );
};

export default WrappedEmblaGallery;
