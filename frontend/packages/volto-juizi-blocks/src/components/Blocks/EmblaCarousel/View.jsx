/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import './carousel-base.css';
import './carousel.css';
import '../_shared/skeleton.css';
import {
  getButtonClasses,
  getColorTextStyle,
  isColorDark,
} from '../../../config/colors';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import { getHref } from '../_shared/links';
import { getImageUrl, getListingImageUrl } from '../_shared/images';
import { blockAnchorId } from '../_shared/anchors';
import { formatDate } from '../_shared/format';

// The picture for a slide: query results use their image (or preview
// image); slides added in the sidebar use the picked image, through the same
// size-aware resolver, so a 48px logo isn't served at full resolution.
const imageFor = (slide, targetSize) => {
  try {
    if (slide.isFromListing) {
      return (
        getImageUrl(slide, targetSize) ||
        getListingImageUrl(slide.link, targetSize)
      );
    }
    const image = Array.isArray(slide.image) ? slide.image[0] : slide.image;
    if (!image) return '';
    const scaledUrl = getImageUrl(image, targetSize);
    if (scaledUrl) return scaledUrl;
    return image?.['@id']
      ? `${image['@id']}/@@images/image`
      : image?.download || '';
  } catch (e) {
    return '';
  }
};

// eslint-disable-next-line no-unused-vars
const getPresetConfig = (preset) => {
  switch (preset) {
    case 'loop':
      return { loop: true };
    case 'scroll':
      return { slidesToScroll: 1 };
    case 'contain':
      return { containScroll: 'trimSnaps' };
    case 'dragFree':
      return { dragFree: true };
    case 'snaps':
      return { skipSnaps: false };
    default:
      return {};
  }
};

// Utility to derive a friendly class from the color value & label
const colorToClass = (value, label) => {
  if (!value) return '';
  const varMatch = /^var\(--([^)]+)\)/.exec(value);
  if (varMatch) return `color-var-${varMatch[1].toLowerCase()}`;
  if (value.startsWith('#')) return `color-${value.slice(1).toLowerCase()}`;
  if (label) return `color-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return '';
};

// Minimal decorative arrow used on slide/listing buttons when enabled.
// aria-hidden since the button's own label already conveys the link's purpose.
const SlideButtonArrow = () => (
  <svg
    className="embla__slide-btn-arrow"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Plain line-arrow used for the prev/next navigation buttons (replaces the
// old Bootstrap Icon font glyphs so the carousel has no external icon-font
// dependency). Purely decorative — the button's own aria-label carries the
// accessible name.
const NavArrowIcon = ({ direction }) => (
  <svg
    className="embla__nav-arrow-icon"
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

const EmblaCarousel = (blockProps) => {
  const { data, id, isEditMode } = blockProps;
  const dispatch = useDispatch();
  const searchResults = useSelector((state) => state.search?.subrequests?.[id]);
  const allSubrequests = useSelector(
    (state) => state.search?.subrequests || {},
  );

  // Resolved path map: uid -> '/site/path'
  const [resolvedPaths, setResolvedPaths] = useState({});

  // When a resolveuid subrequest lands, extract the path from its first result
  useEffect(() => {
    if (!data.useListing || !data.query?.query) return;
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
  }, [allSubrequests, data.useListing, data.query, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!data.useListing || !data.query?.query) return;
    const uidCriteria = data.query.query.filter(
      (c) =>
        c.i === 'path' &&
        c.o === 'plone.app.querystring.operation.string.absolutePath',
    );
    if (!uidCriteria.length) return;

    // Parse "uid::depth" — resolve each unique UID we haven't seen yet
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
          {
            UID: uid,
            metadata_fields: [],
            b_size: 1,
          },
          resolveId,
        ),
      );
    });
  }, [data.useListing, data.query]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderDate = (slide) => {
    const mode = data.dateDisplay;
    if (!mode || mode === 'none') return null;
    if (mode === 'effective') {
      if (!slide.effectiveDate) return null;
      return <p className="slide-date">{formatDate(slide.effectiveDate)}</p>;
    }
    if (mode === 'start') {
      if (slide.startDate) {
        return (
          <p className="slide-date">Starts {formatDate(slide.startDate)}</p>
        );
      }
      if (slide.effectiveDate) {
        return <p className="slide-date">{formatDate(slide.effectiveDate)}</p>;
      }
      return null;
    }
    return null;
  };

  const convertItemToSlide = (item) => ({
    heading: item.title || '',
    content: item.description || '',
    image: null,
    link: item,
    buttonText: data.listingButtonText || 'Read more',
    buttonArrow: !!data.listingButtonArrow,
    effectiveDate: item.effective || null,
    startDate: item.start || null,
    subjects: item.Subject || [],
    '@id': item['@id'] || null,
    image_field: item.image_field || null,
    image_scales: item.image_scales || null,
    preview_image_scales: item.preview_image_scales || null,
    preview_image_field: item.preview_image_field || null,
    lead_image: item.lead_image || null,
    isFromListing: true,
  });

  const getSlides = () => {
    let slides = [];
    if (
      data.useListing &&
      searchResults?.items &&
      searchResults.items.length > 0
    ) {
      let items = searchResults.items;

      // @search doesn't honour Subject.operator natively, so we enforce AND/OR client-side.
      const subjectCriterion = data.query?.query?.find(
        (c) => c.i === 'Subject',
      );
      if (
        subjectCriterion &&
        Array.isArray(subjectCriterion.v) &&
        subjectCriterion.v.length > 1
      ) {
        if (
          subjectCriterion.o === 'plone.app.querystring.operation.selection.all'
        ) {
          // AND: item must have every selected tag
          items = items.filter((item) => {
            const subjects = item.Subject || [];
            return subjectCriterion.v.every((tag) => subjects.includes(tag));
          });
        } else if (
          subjectCriterion.o === 'plone.app.querystring.operation.selection.any'
        ) {
          // OR: item must have at least one selected tag
          items = items.filter((item) => {
            const subjects = item.Subject || [];
            return subjectCriterion.v.some((tag) => subjects.includes(tag));
          });
        }
      }

      slides = items.map(convertItemToSlide);
    }
    if (!data.useListing || (data.useListing && data.appendManualSlides)) {
      const manualSlides = (data.slides || []).map((slide) => ({
        ...slide,
        isFromListing: false,
      }));
      slides = slides.concat(manualSlides);
    }
    // Image only: a slide without a picture is left out for visitors (dots
    // and arrows then match what's shown); editors see it flagged.
    const imageOnly = (data.displayMode || data.mode) === 'image-only';
    if (imageOnly && !isEditMode) {
      slides = slides.filter((slide) => imageFor(slide));
    }
    return slides;
  };

  // ---- Tag filter state ----
  const parsedFilterTags = React.useMemo(() => {
    if (!data.filterTags) return [];
    return data.filterTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [data.filterTags]);

  const [activeTag, setActiveTag] = useState('all');

  // Reset to 'all' if tags change
  useEffect(() => {
    setActiveTag('all');
  }, [data.filterTags]);

  const allSlides = getSlides();

  // Determine which tags actually have matching slides
  const tagsWithSlides = React.useMemo(() => {
    return parsedFilterTags.filter((tag) =>
      allSlides.some((slide) => {
        const subjects = slide.subjects || slide.link?.Subject || [];
        return Array.isArray(subjects)
          ? subjects.includes(tag)
          : subjects === tag;
      }),
    );
  }, [parsedFilterTags, allSlides]);

  const slides = React.useMemo(() => {
    if (!parsedFilterTags.length || activeTag === 'all') return allSlides;
    return allSlides.filter((slide) => {
      const subjects = slide.subjects || slide.link?.Subject || [];
      return Array.isArray(subjects)
        ? subjects.includes(activeTag)
        : subjects === activeTag;
    });
  }, [allSlides, activeTag, parsedFilterTags]);

  const slidesToShow = parseInt(data.slidesToShow, 10) || 1;
  const minSlidesOnMobile = parseInt(data.minSlidesOnMobile, 10) || 1;

  const calculateSlidesToShow = React.useCallback(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    if (w <= 540) return Math.max(1, minSlidesOnMobile);
    if (w <= 768) return Math.min(slidesToShow, Math.max(1, minSlidesOnMobile));
    return slidesToShow;
  }, [slidesToShow, minSlidesOnMobile]);

  const [effectiveSlidesToShow, setEffectiveSlidesToShow] = useState(
    calculateSlidesToShow,
  );
  useEffect(() => {
    const onResize = () => {
      setEffectiveSlidesToShow(calculateSlidesToShow());
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [calculateSlidesToShow]);

  useEffect(() => {
    if (data.useListing && data.query) {
      const baseOptions = {
        metadata_fields: [
          'title',
          'description',
          'image_field',
          'image_scales',
          'preview_image_scales',
          'preview_image_field',
          'lead_image',
          'effective',
          'start',
          'remoteUrl',
          'Subject',
        ],
      };

      let searchOptions;
      let searchTerm = '';

      if (typeof data.query === 'object' && data.query !== null) {
        if (data.query.query && Array.isArray(data.query.query)) {
          // Transform the Volto query widget's criteria array into flat searchContent params.
          // We do this generically so every criterion passes through regardless of index name.
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
              const keyMap = {
                portal_type: 'portal_type',
                Subject: 'Subject',
                review_state: 'review_state',
              };
              const key = keyMap[criterion.i] || criterion.i;
              transformedQuery[key] = criterion.v;
            }
          });
          if (pathPending) return; // don't dispatch until path is resolved
          if (data.query.sort_on) transformedQuery.sort_on = data.query.sort_on;
          if (data.query.sort_order)
            transformedQuery.sort_order = data.query.sort_order;
          if (data.query.limit)
            transformedQuery.b_size = parseInt(data.query.limit, 10);
          searchOptions = { ...transformedQuery, ...baseOptions };
        } else {
          // Query is already a flat object (e.g. set programmatically)
          searchOptions = { ...data.query, ...baseOptions };
          if (data.query.limit)
            searchOptions.b_size = parseInt(data.query.limit, 10);
        }
      } else if (typeof data.query === 'string') {
        searchTerm = data.query;
        searchOptions = baseOptions;
      } else {
        searchOptions = { ...baseOptions, query: data.query };
      }

      dispatch(searchContent(searchTerm, searchOptions, id));
    }
  }, [data.useListing, data.query, resolvedPaths, dispatch, id]);

  const carouselType = data.carouselType || 'default';

  const configOverrides = {
    default: { align: 'start', loop: data.loop ?? true },
    centered: { align: 'center', loop: true },
    peek: { align: 'start', loop: true },
    cards: { align: 'start', loop: false, containScroll: 'trimSnaps' },
  };

  const presetConfig = getPresetConfig(data.preset);
  const baseConfig = configOverrides[carouselType] || configOverrides.default;
  const config = { ...baseConfig, ...presetConfig };

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Respect reduced motion: disable autoplay for users who have requested it
  // in their OS settings. The carousel still works — it just doesn't advance
  // automatically, removing the distraction and motion risk.
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
  const [viewportRef, embla] = useEmblaCarousel(
    {
      ...config,
      loop: data.loop ?? true,
      // "Centre active card" was removed; saved carousels that had it on
      // now scroll like the others.
      align: 'start',
      slidesToScroll: effectiveSlidesToShow,
    },
    plugins,
  );

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelectedIndex(embla.selectedScrollSnap());
    onSelect(); // set initial selected index
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
  }, [embla]);

  // Scroll back to start whenever active tag changes
  useEffect(() => {
    if (!embla) return;
    embla.reInit();
    embla.scrollTo(0, true);
    setSelectedIndex(0);
  }, [activeTag, embla]);

  const _displayMode = data.displayMode || data.mode || 'full';
  const isLogoMarquee = _displayMode === 'logo-marquee';
  const variantClass = `type-${_displayMode}`;
  const isImageOnly = _displayMode === 'image-only';
  const isImageTopMode = _displayMode === 'image-top';

  // Solid buttons paint their background from --btn-color; without this the
  // text is hardcoded white in CSS and disappears against light colours
  // (e.g. a white swatch). Adds --btn-text so CSS can pick a readable
  // contrast colour per swatch, the same way slide/block backgrounds do.
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

  // Whether a slide shows its button: it needs a label, and the style must
  // show buttons at all.
  const showsButton = (slide) =>
    !!slide.buttonText?.trim() && !data.hideButtons && !isImageOnly;

  // With "Make entire card clickable", one real link per slide covers the
  // whole card (CSS: .embla__stretched-link::after): the button, or the
  // heading when there's no button, or the picture in Image only mode.
  const isClickable = (slide) =>
    !!data.clickableSlides && !!getHref(slide.link);

  const renderLink = (slide) => {
    if (!showsButton(slide)) return null;
    const href = getHref(slide.link);
    const label = slide.buttonText.trim();
    // Listing-sourced slides use their own style/link toggle so query
    // results can look different from manually added slides.
    const styleValue = slide.isFromListing
      ? data.listingButtonStyle
      : data.slideButtonStyle;
    const isLinkStyle = slide.isFromListing
      ? !!data.listingButtonLinkStyle
      : !!data.slideButtonLinkStyle;
    const parsed = withContrastText(
      getButtonClasses(styleValue, 'embla__slide-btn'),
    );
    const className = [
      parsed.className,
      isLinkStyle ? 'embla__slide-btn--link' : '',
      isClickable(slide) ? 'embla__stretched-link' : '',
    ]
      .filter(Boolean)
      .join(' ');
    if (!href) {
      // Button text but no link: flagged for editors, hidden for visitors.
      return isEditMode ? (
        <span className={`${className} block__unfinished`} style={parsed.style}>
          <EditHint isEditMode as="span">
            Add a link
          </EditHint>
        </span>
      ) : null;
    }
    return (
      <UniversalLink href={href} className={className} style={parsed.style}>
        {label}
        {slide.buttonArrow && <SlideButtonArrow />}
      </UniversalLink>
    );
  };

  const renderHeading = (slide) => {
    if (!slide.heading) return null;
    if (isClickable(slide) && !showsButton(slide)) {
      return (
        <h3>
          <UniversalLink
            href={getHref(slide.link)}
            className="embla__stretched-link"
          >
            {slide.heading}
          </UniversalLink>
        </h3>
      );
    }
    return <h3>{slide.heading}</h3>;
  };

  // Logo marquee only wants deliberate links, not getHref's normal fallback
  // to an item's own page. For listing-sourced slides that means: clickable
  // only when the query result is itself a Link item (remoteUrl set) — a
  // plain queried Image stays a static, non-clickable logo. Manual slides
  // keep ordinary getHref resolution since the editor explicitly chose that
  // link via the slide's own "Link" field.
  const getMarqueeHref = (slide) => {
    if (slide.isFromListing) {
      const item = slide.link;
      return item?.['@type'] === 'Link' && item.remoteUrl ? getHref(item) : '';
    }
    return getHref(slide.link);
  };

  // Block background image — same pattern as HeroBlock's image-bg layer.
  const blockBgImage = Array.isArray(data.backgroundImage)
    ? data.backgroundImage[0]
    : data.backgroundImage;
  const blockImageUrl = blockBgImage?.['@id']
    ? `${blockBgImage['@id']}/@@images/image`
    : '';

  const heightClass = data.equalHeight ? 'equal-height' : '';
  const modeClass = data.mode ? `mode-${data.mode}` : '';
  const colorClass = colorToClass(data.backgroundColor);
  // Text and dot colour follow the background colour. Only over a
  // background image (which can't be judged automatically) does the editor
  // choose, defaulting to light text.
  const hasBgColor =
    !!data.backgroundColor && data.backgroundColor !== 'transparent';
  const tone = blockImageUrl
    ? data.textTone === 'dark'
      ? 'dark'
      : 'light'
    : hasBgColor && isColorDark(data.backgroundColor)
      ? 'light'
      : 'dark';
  const toneClass = `tone-${tone}`;
  const slideBg = data.slideBackgroundColor;
  const slideToneClass =
    slideBg && slideBg !== 'transparent'
      ? isColorDark(slideBg)
        ? 'slide-bg-dark'
        : 'slide-bg-light'
      : '';
  // Anchor for same-page links (unchanged format): the heading's slug plus
  // the block id's first 6 characters, or embla-<id> without a heading.
  const blockId = blockAnchorId(data.title, id, 'embla');
  // Separate stable ID for the heading element, used by aria-labelledby.
  const headingId = data.title ? `embla-heading-${id || 'block'}` : undefined;

  // The logo strip scrolls only when the logos don't all fit; otherwise it's
  // a still row. Measured in the browser (the server renders the still row),
  // and again whenever the strip is resized.
  const marqueeRef = React.useRef(null);
  const marqueeTrackRef = React.useRef(null);
  const measureMarqueeRef = React.useRef(() => {});
  const [marqueeOverflows, setMarqueeOverflows] = useState(false);
  useEffect(() => {
    if (!isLogoMarquee) return undefined;
    const container = marqueeRef.current;
    const track = marqueeTrackRef.current;
    if (!container || !track) return undefined;
    const measure = () => {
      // Add up one set of logos at their own width. The track's width can't
      // be used: the still row wraps to fit the strip, so it never looked
      // wider than the strip and the logos never started scrolling. While
      // scrolling, the track holds two copies of the logos.
      const items = Array.from(track.children);
      const count = marqueeOverflows ? items.length / 2 : items.length;
      const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      let logosWidth = gap * Math.max(count - 1, 0);
      for (let i = 0; i < count; i += 1) {
        logosWidth += items[i].getBoundingClientRect().width;
      }
      setMarqueeOverflows(logosWidth > container.clientWidth + 1);
    };
    // Logos have no width until their picture loads: measure again then.
    measureMarqueeRef.current = measure;
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [
    isLogoMarquee,
    slides.length,
    data.logoHeight,
    data.logoGap,
    data.logoPadding,
    marqueeOverflows,
  ]); // eslint-disable-line react-hooks/exhaustive-deps
  const isMarqueeStatic = isLogoMarquee && !marqueeOverflows;

  // No arrows when every slide is already in view.
  const showArrows =
    data.hideArrows !== true &&
    slides.length > effectiveSlidesToShow &&
    !isLogoMarquee;
  const showDots =
    data.hideDots !== true && slides.length > 0 && !isLogoMarquee;

  // Arrow position and "more" button position are independent — either can
  // sit at the top (beside the heading) or below the carousel.
  // 'bottom' is the stored value for arrows on each side of the carousel
  // (its old label said "below"); 'below' is a row under the carousel.
  // On phones the arrows always sit in a row below the carousel, whatever
  // the setting: the row below is always rendered and the CSS shows it on
  // phones and hides the other positions (carousel-base.css).
  const arrowsAtTop = showArrows && data.arrowPosition === 'top';
  const arrowsBelow = showArrows && data.arrowPosition === 'below';
  const arrowPlacement = arrowsAtTop ? 'top' : arrowsBelow ? 'below' : 'sides';
  // The "More" button needs text and a link; with text only, editors see it
  // flagged and visitors don't see it.
  const headerLinkHref = getHref(data.headerLinkUrl);
  const hasMoreButton =
    !!data.headerLinkText && (!!headerLinkHref || isEditMode);
  const buttonAtTop =
    hasMoreButton && (data.moreButtonPosition || 'top') === 'top';
  const buttonAtBottom = hasMoreButton && data.moreButtonPosition === 'bottom';

  const arrowStyleParsed = withContrastText(
    getButtonClasses(
      data.arrowStyle === 'default' ? '' : data.arrowStyle,
      'embla__arrow',
    ),
  );
  const linkStyleParsed = withContrastText(
    getButtonClasses(data.headerLinkStyle, 'embla__header-link'),
  );

  const pageCount = Math.ceil(slides.length / effectiveSlidesToShow);

  const moreButton = headerLinkHref ? (
    <UniversalLink
      href={headerLinkHref}
      className={linkStyleParsed.className}
      style={linkStyleParsed.style}
    >
      {data.headerLinkText}
    </UniversalLink>
  ) : (
    <span
      className={`${linkStyleParsed.className} block__unfinished`}
      style={linkStyleParsed.style}
    >
      <EditHint isEditMode={isEditMode} as="span">
        Add a link
      </EditHint>
    </span>
  );

  // Filter buttons whose tag matches nothing: editors are told why the
  // button is missing; visitors just don't see it.
  const unmatchedTags = parsedFilterTags.filter(
    (tag) => !tagsWithSlides.includes(tag),
  );

  const wrapperClassName = [
    `type-${_displayMode}`,
    `align-${data.alignment || 'left'}`,
    toneClass,
  ].join(' ');
  // Picture shape (image-only and image-above-content styles): a stored
  // "16:9" becomes the CSS aspect-ratio "16 / 9".
  const imageRatio =
    (isImageOnly || isImageTopMode) &&
    /^\d+:\d+$/.test(data.imageAspectRatio || '')
      ? data.imageAspectRatio.replace(':', ' / ')
      : '';

  const sectionProps = {
    id: blockId,
    className: `embla ${heightClass} ${data.isFullWidth ? 'full-width' : ''} ${imageRatio ? 'has-image-ratio' : ''} align-${data.alignment || 'left'} ${modeClass} ${variantClass} ${toneClass} ${colorClass} ${blockImageUrl ? 'has-bg-image' : ''} ${data.outerClassName || ''}`,
    style: {
      ...(imageRatio ? { '--slide-image-ratio': imageRatio } : {}),
      backgroundColor: data.backgroundColor || 'transparent',
      // Text follows the background colour (unless there's an image).
      ...(!blockImageUrl ? getColorTextStyle(data.backgroundColor) : {}),
      ...(blockImageUrl
        ? {
            backgroundImage: `url(${blockImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : {}),
    },
    ...(headingId ? { 'aria-labelledby': headingId } : {}),
  };

  // ── No slides: still loading, or nothing to show ──────────────────────
  const queryLoading =
    !!data.useListing &&
    !!data.query &&
    (!searchResults || searchResults.loading) &&
    !searchResults?.items?.length;
  if (allSlides.length === 0) {
    if (!queryLoading && !isEditMode) return null;
    const heading = (
      <>
        {data.title ? (
          <h2 className="embla__title" id={headingId}>
            {data.title}
          </h2>
        ) : null}
        {data.description ? (
          <p className="embla__description">{data.description}</p>
        ) : null}
      </>
    );
    return (
      <BlockWrapper {...blockProps} className={wrapperClassName}>
        <section {...sectionProps} aria-busy={queryLoading || undefined}>
          <div className="embla__inner">
            {heading}
            {queryLoading ? (
              <div
                className="block-skeleton"
                aria-hidden="true"
                style={{
                  '--block-skeleton-cols': isLogoMarquee
                    ? 6
                    : effectiveSlidesToShow,
                  '--block-skeleton-height': isLogoMarquee ? '48px' : '220px',
                }}
              >
                {Array.from({
                  length: isLogoMarquee ? 6 : effectiveSlidesToShow,
                }).map((_, i) => (
                  <div className="block-skeleton__tile" key={i} />
                ))}
              </div>
            ) : (
              <BlockPlaceholder
                blockClass="embla"
                prompt={
                  data.useListing
                    ? 'Your content query found nothing to show. Change its criteria in the sidebar.'
                    : "No slides yet. Add slides in the sidebar under Slides, or switch on 'Fill automatically from site content' to fill it automatically."
                }
              />
            )}
          </div>
        </section>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper {...blockProps} className={wrapperClassName}>
      {/* section + aria-labelledby gives screen reader users a named landmark
        they can navigate to directly. Only applied when a heading is present. */}
      <section {...sectionProps}>
        <div className="embla__inner">
          {/* Logo marquee */}
          {isLogoMarquee ? (
            <>
              {data.title ? (
                <h2 className="embla__title" id={headingId}>
                  {data.title}
                </h2>
              ) : null}
              {data.description ? (
                <p className="embla__description">{data.description}</p>
              ) : null}
              <div
                ref={marqueeRef}
                className={`logo-marquee ${isMarqueeStatic ? `static align-${data.logoAlignment || 'center'}` : ''} ${!isMarqueeStatic && data.pauseOnHover ? 'pause-on-hover' : ''} ${slideToneClass}`}
                style={{
                  '--marquee-duration': `${parseInt(data.marqueeSpeed, 10) || 20}s`,
                  '--logo-height': `${parseInt(data.logoHeight, 10) || 48}px`,
                  '--logo-gap': `${parseInt(data.logoGap, 10) || 32}px`,
                  '--logo-pad': `${parseInt(data.logoPadding, 10) || 8}px`,
                  backgroundColor:
                    data.slideBackgroundColor &&
                    data.slideBackgroundColor !== 'transparent'
                      ? data.slideBackgroundColor
                      : undefined,
                }}
              >
                <div className="logo-marquee__track" ref={marqueeTrackRef}>
                  {(isMarqueeStatic ? slides : [...slides, ...slides]).map(
                    (slide, i) => {
                      const src = imageFor(
                        slide,
                        parseInt(data.logoHeight, 10) || 48,
                      );
                      if (!src) return null;
                      const alt = slide.heading || 'Logo';
                      const href = getMarqueeHref(slide);
                      // Marquee has no "card" fieldset (and so no clickableSlides
                      // toggle) exposed in the sidebar — a logo is clickable
                      // simply because it has a link, per the fieldset help text.
                      const clickable = href && href !== '#';
                      const img = (
                        <img
                          className="logo-marquee__img"
                          src={src}
                          alt={alt}
                          onLoad={() => measureMarqueeRef.current()}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      );
                      return (
                        <div className="logo-marquee__item" key={`r-${i}`}>
                          {clickable ? (
                            <a
                              href={href}
                              className="logo-marquee__link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {img}
                            </a>
                          ) : (
                            img
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              {isMarqueeStatic && slides.length > 0 && (
                <EditHint isEditMode={isEditMode}>
                  All the logos fit across, so the strip stays still. It scrolls
                  once there are more logos than fit.
                </EditHint>
              )}
              {!isMarqueeStatic && reducedMotion && (
                <EditHint isEditMode={isEditMode}>
                  Your device is set to reduce motion, so the strip isn&apos;t
                  moving for you. Visitors without that setting see it scroll.
                </EditHint>
              )}
            </>
          ) : (
            <>
              {/* Header row — title/description left, arrows and/or button right
                whenever either is set to the "top" position. Arrow position
                and button position are independent of each other. */}
              {(data.title ||
                data.description ||
                arrowsAtTop ||
                buttonAtTop) && (
                <div
                  className={`embla__header ${arrowsAtTop || buttonAtTop ? 'embla__header--has-controls' : ''}`}
                >
                  <div className="embla__header-top">
                    {data.title ? (
                      // id ties this heading to the section aria-labelledby
                      <h2 className="embla__title" id={headingId}>
                        {data.title}
                      </h2>
                    ) : null}
                    {((arrowsAtTop && slides.length > 1) || buttonAtTop) && (
                      <div className="embla__header-controls embla__header-controls--desktop">
                        {arrowsAtTop && (
                          <button
                            className={`embla__prev ${arrowStyleParsed.className}`}
                            style={arrowStyleParsed.style}
                            aria-label="Previous slide"
                            onClick={() => embla && embla.scrollPrev()}
                          >
                            <NavArrowIcon direction="left" />
                          </button>
                        )}
                        {buttonAtTop && moreButton}
                        {arrowsAtTop && (
                          <button
                            className={`embla__next ${arrowStyleParsed.className}`}
                            style={arrowStyleParsed.style}
                            aria-label="Next slide"
                            onClick={() => embla && embla.scrollNext()}
                          >
                            <NavArrowIcon direction="right" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {data.description ? (
                    <p className="embla__description">{data.description}</p>
                  ) : null}
                  {/* Phones: only the "More" button stays up here; the
                    arrows are in the row below the carousel. */}
                  {buttonAtTop && (
                    <div className="embla__header-controls embla__header-controls--mobile">
                      {moreButton}
                    </div>
                  )}
                </div>
              )}

              {/* Title/description standalone when no top controls */}
              {!arrowsAtTop && !buttonAtTop && !data.title && !data.description
                ? null
                : null}

              {/* Tag filter tabs */}
              {tagsWithSlides.length > 0 && (
                <div
                  className="embla__filter-tabs"
                  role="tablist"
                  aria-label="Filter content"
                >
                  <button
                    role="tab"
                    aria-selected={activeTag === 'all'}
                    className={`embla__filter-tab ${activeTag === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveTag('all')}
                  >
                    All
                  </button>
                  {tagsWithSlides.map((tag) => (
                    <button
                      key={tag}
                      role="tab"
                      aria-selected={activeTag === tag}
                      className={`embla__filter-tab ${activeTag === tag ? 'is-active' : ''}`}
                      onClick={() => setActiveTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {/* Phones: the same filter as a dropdown (the tabs are hidden
                there, see carousel-base.css). */}
              {tagsWithSlides.length > 0 && (
                <div className="embla__filter-select">
                  <label htmlFor={`${id}-filter`}>Show:</label>
                  <select
                    id={`${id}-filter`}
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                  >
                    <option value="all">All</option>
                    {tagsWithSlides.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {unmatchedTags.map((tag) => (
                <EditHint key={tag} isEditMode={isEditMode}>
                  No results tagged &apos;{tag}&apos;, so its button is hidden.
                </EditHint>
              ))}
              <div className="embla__viewport" ref={viewportRef}>
                <div className="embla__container">
                  {slides.map((slide, index) => {
                    const imageUrl = imageFor(slide);
                    const href = getHref(slide.link);
                    const clickable = isClickable(slide);

                    return (
                      <div
                        className="embla__slide"
                        key={index}
                        style={{ flex: `0 0 ${100 / effectiveSlidesToShow}%` }}
                      >
                        <div className="slide__content">
                          <div
                            className={`carousel-slide-inner ${clickable ? 'clickable' : ''} ${isImageOnly ? 'image-only' : ''} ${isImageTopMode ? 'image-top' : ''} ${slide.isFromListing ? 'listing-slide' : 'manual-slide'} ${!isImageOnly && !isImageTopMode && !imageUrl ? 'no-image' : ''} ${slideToneClass}`}
                            style={{
                              backgroundImage:
                                !isImageOnly && !isImageTopMode && imageUrl
                                  ? `url(${imageUrl})`
                                  : 'none',
                              '--slide-bg':
                                data.slideBackgroundColor &&
                                data.slideBackgroundColor !== 'transparent'
                                  ? data.slideBackgroundColor
                                  : undefined,
                            }}
                          >
                            {isImageOnly ? (
                              imageUrl ? (
                                clickable ? (
                                  // The picture is the slide's one link; its
                                  // alt text (the heading) names the link.
                                  <UniversalLink
                                    href={href}
                                    className="embla__stretched-link"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={slide.heading || ''}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </UniversalLink>
                                ) : (
                                  <img
                                    src={imageUrl}
                                    alt={slide.heading || ''}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )
                              ) : (
                                // Visitors never get here: picture-less slides
                                // are left out for them (see getSlides).
                                <div className="image-placeholder block__unfinished">
                                  <EditHint isEditMode={isEditMode}>
                                    Add a picture to this slide in the sidebar.
                                  </EditHint>
                                </div>
                              )
                            ) : isImageTopMode ? (
                              <div
                                className={`card card-image-top ${imageUrl && !data.hideCardImage ? '' : 'no-image'}`}
                              >
                                {imageUrl && !data.hideCardImage ? (
                                  <div className="card-media">
                                    <img
                                      src={imageUrl}
                                      alt={slide.heading || ''}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : null}
                                <div className="card-content">
                                  {renderHeading(slide)}
                                  {renderDate(slide)}
                                  {!data.hideDescription && (
                                    <p>{slide.content}</p>
                                  )}
                                  {renderLink(slide)}
                                </div>
                              </div>
                            ) : (
                              <div className="slide__body">
                                {renderHeading(slide)}
                                {renderDate(slide)}
                                {!data.hideDescription && (
                                  <p>{slide.content}</p>
                                )}
                                {renderLink(slide)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arrows on the sides or below; with arrows at the top this
                row is only shown on phones (display: none elsewhere, so
                screen readers don't meet the arrows twice). */}
              {showArrows && slides.length > 1 && (
                <div
                  className={`embla__controls embla__controls--${arrowPlacement}`}
                >
                  <div className="embla__controls__buttons">
                    <button
                      className={`embla__prev ${arrowStyleParsed.className}`}
                      style={arrowStyleParsed.style}
                      aria-label="Previous slide"
                      onClick={() => embla && embla.scrollPrev()}
                    >
                      <NavArrowIcon direction="left" />
                    </button>
                    <button
                      className={`embla__next ${arrowStyleParsed.className}`}
                      style={arrowStyleParsed.style}
                      aria-label="Next slide"
                      onClick={() => embla && embla.scrollNext()}
                    >
                      <NavArrowIcon direction="right" />
                    </button>
                  </div>
                </div>
              )}

              {showDots && pageCount > 1 && (
                <div
                  className="embla__nav"
                  role="tablist"
                  aria-label="Slide navigation"
                >
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-label={`Go to slide ${i + 1}`}
                      aria-selected={i === selectedIndex}
                      onClick={() => embla && embla.scrollTo(i)}
                      className={`embla__dot ${i === selectedIndex ? 'is-selected' : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* "More" button below the carousel (and its dots) when positioned
                at the bottom — aligned independently via moreButtonAlign. */}
              {buttonAtBottom && (
                <div
                  className={`embla__more-button-row align-${data.moreButtonAlign || 'center'}`}
                >
                  {moreButton}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </BlockWrapper>
  );
};

const CarouselPlaceholder = () => (
  <BlockPlaceholder
    blockClass="embla"
    prompt="Select a display style in the sidebar to get started."
    modes={[
      {
        name: 'Image with text overlay',
        description:
          'slides with the heading, text and button laid over the image',
      },
      {
        name: 'Image only',
        description: 'a clean image carousel with no text on the slides',
      },
      {
        name: 'Image above content',
        description:
          'card-style slides: image on top, heading, text and button below',
      },
      {
        name: 'Scrolling logo strip',
        description:
          'a continuously scrolling row of logos, e.g. partners or sponsors',
      },
    ]}
  />
);

const WrappedEmblaCarousel = (props) => {
  const { data } = props;
  // Don't mount EmblaCarousel (and its hooks) until a style is selected:
  // this outer wrapper is hook-free. The start screen shows only in the
  // editor; visitors see nothing.
  const isEditMode = isEditing(props);
  if (!data?.displayMode) {
    if (!isEditMode) return null;
    return (
      <BlockWrapper {...props}>
        <CarouselPlaceholder />
      </BlockWrapper>
    );
  }
  return (
    <BlockErrorBoundary
      blockClass="embla"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(data)}
    >
      <EmblaCarousel
        {...props}
        id={props.id || props.block}
        isEditMode={isEditMode}
      />
    </BlockErrorBoundary>
  );
};

export default WrappedEmblaCarousel;
