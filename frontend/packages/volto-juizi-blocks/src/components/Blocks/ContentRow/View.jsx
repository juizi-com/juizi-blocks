import React from 'react';
import { useIntl } from 'react-intl';
import {
  customSvgMap,
  FallbackIcon,
  lucideIconMap,
} from '../../../config/iconChoices';
import VoltoIcon from '@plone/volto/components/theme/Icon/Icon';
import {
  getButtonClasses,
  isColorDark,
  colorValueToKey,
  getColorTextStyle,
} from '../../../config/colors';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import { externalLinkProps, getHref } from '../_shared/links';
import { DEFAULT_OVERLAY, overlayBackground } from '../../../config/gradients';
import { blockAnchorId } from '../_shared/anchors';
import { getPickedImageUrl } from '../_shared/images';
import { formatNumber } from '../_shared/format';
import shared from '../_shared/messages';
import messages from './messages';
import './style.css';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

// Hook-free slate node renderer
// serializeNodesToHtml uses hooks internally so we render nodes directly.
const SlateLeaf = ({ leaf }) => {
  let el = <>{typeof leaf.text === 'string' ? leaf.text : ''}</>;
  if (leaf.bold) el = <strong>{el}</strong>;
  if (leaf.italic) el = <em>{el}</em>;
  if (leaf.underline) el = <u>{el}</u>;
  if (leaf.strikethrough) el = <s>{el}</s>;
  if (leaf.code) el = <code>{el}</code>;
  return el;
};

const SlateNode = ({ node }) => {
  if (!node) return null;
  // Leaf (text node)
  if (node.text !== undefined)
    return (
      <SlateLeaf
        leaf={{ ...node, text: typeof node.text === 'string' ? node.text : '' }}
      />
    );
  const children = (node.children || []).map((child, i) => (
    <SlateNode key={i} node={child} />
  ));
  switch (node.type) {
    case 'p':
      return <p>{children}</p>;
    case 'h1':
      return <h1>{children}</h1>;
    case 'h2':
      return <h2>{children}</h2>;
    case 'h3':
      return <h3>{children}</h3>;
    case 'h4':
      return <h4>{children}</h4>;
    case 'ul':
      return <ul>{children}</ul>;
    case 'ol':
      return <ol>{children}</ol>;
    case 'li':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'a':
      return <a href={node.url || node.href || '#'}>{children}</a>;
    case 'strong':
      return <strong>{children}</strong>;
    case 'em':
      return <em>{children}</em>;
    default:
      return <>{children}</>;
  }
};

const RichText = ({ data, className }) => {
  if (!data) return null;
  // Draftjs format: { data: "<p>html string</p>" }
  if (data?.data !== undefined) {
    if (typeof data.data === 'string') {
      /* eslint-disable-next-line react/no-danger */
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: data.data }}
        />
      );
    }
    // Slate array nested under data key
    if (Array.isArray(data.data)) {
      return (
        <div className={className}>
          {data.data.map((node, i) => (
            <SlateNode key={i} node={node} />
          ))}
        </div>
      );
    }
  }
  // Slate format: top-level array
  if (Array.isArray(data)) {
    return (
      <div className={className}>
        {data.map((node, i) => (
          <SlateNode key={i} node={node} />
        ))}
      </div>
    );
  }
  // Plain string
  if (typeof data === 'string') {
    /* eslint-disable-next-line react/no-danger */
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: data }} />
    );
  }
  return null;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

// Guard against richtext objects being passed to string fields
const safeString = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  // richtext { data: [...] } — extract plain text
  if (val?.data && Array.isArray(val.data)) {
    return val.data
      .map((node) => (node.children || []).map((c) => c.text || '').join(''))
      .join(' ');
  }
  return '';
};

const getImageUrl = (image) => getPickedImageUrl(image, 'large') || null;

// ─── Count-up animation ────────────────────────────────────────────────────

// The server (and visitors without JavaScript) get the real number. In the
// browser it counts up once, when the statistic first comes into view.
// Reduced motion: no animation.
const CountUp = ({ end = 0, duration = 2000, formatK = false }) => {
  const { locale } = useIntl();
  const safeEnd = Number(end) || 0;
  const [value, setValue] = React.useState(safeEnd);
  const ref = React.useRef(null);

  React.useEffect(() => {
    setValue(safeEnd);
    const el = ref.current;
    const reducedMotion =
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reducedMotion || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    let raf;
    const animate = () => {
      let start = null;
      const step = (ts) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        let next = Math.floor(progress * safeEnd);
        if (formatK && safeEnd >= 1000) next = next - (next % 1000);
        setValue(progress < 1 ? next : safeEnd);
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [safeEnd, duration, formatK]);

  const text =
    formatK && safeEnd >= 1000
      ? `${formatNumber(Math.max(1, Math.floor(value / 1000)), locale)}k`
      : formatNumber(value, locale);
  return <span ref={ref}>{text}</span>;
};

// ─── Card background style ────────────────────────────────────────────────
// An item gets its own tone only when it has its own background: a colour
// (its text follows that colour), or a picture behind the text (light text).
// Otherwise it has no background of its own, and its text follows the
// block's, like the block's heading. (A picture above the text isn't a
// background: the text sits on the block's colour.)
const getCardBgStyle = (item, { pictureBehind = false } = {}) => {
  const imageUrl = getImageUrl(item.image);
  const bg = item.backgroundColor;
  const hasColor = !!bg && bg !== 'transparent';
  const style = hasColor ? { backgroundColor: bg } : {};
  const toneClass = hasColor
    ? isColorDark(bg)
      ? 'bg-dark'
      : 'bg-light'
    : imageUrl && pictureBehind
      ? 'bg-dark'
      : '';
  return { style, imageUrl, toneClass };
};

// ─── CSS scroll snap carousel ──────────────────────────────────────────────
// No dependencies, no React version conflicts.
// Swipe works natively on mobile via CSS scroll-snap.
// Mobile carousel using Embla — only activates below 768px.
// On desktop the grid renders normally regardless of this setting.

const MobileCarousel = ({ children, autoplay, showDots }) => {
  const intl = useIntl();
  // Respect reduced motion: disable autoplay entirely when the user has
  // requested it in their OS settings.
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plugins =
    autoplay && !reducedMotion
      ? [Autoplay({ delay: 4000, stopOnInteraction: true })]
      : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'center', loop: true },
    plugins,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const slideCount = React.Children.count(children);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);

    // Equal height: measure all slides after init and set container height
    const equalizeHeights = () => {
      const slides = emblaApi.slideNodes();
      // Reset first
      slides.forEach((slide) => {
        slide.style.height = '';
      });
      // Find tallest
      const maxHeight = Math.max(...slides.map((s) => s.offsetHeight));
      if (maxHeight > 0) {
        slides.forEach((slide) => {
          slide.style.height = `${maxHeight}px`;
        });
      }
    };

    emblaApi.on('init', equalizeHeights);
    emblaApi.on('resize', equalizeHeights);
    equalizeHeights();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('init', equalizeHeights);
      emblaApi.off('resize', equalizeHeights);
    };
  }, [emblaApi]);

  return (
    <div
      className="content-row__embla"
      role="region"
      aria-label={intl.formatMessage(messages.carouselLabel)}
    >
      <div className="content-row__embla-viewport" ref={emblaRef}>
        <div className="content-row__embla-container">
          {React.Children.map(children, (child, i) => (
            <div key={i} className="content-row__embla-slide">
              {child}
            </div>
          ))}
        </div>
      </div>
      {showDots && slideCount > 1 && (
        <div className="content-row__embla-dots">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              className={`content-row__embla-dot${i === selectedIndex ? ' is-selected' : ''}`}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={intl.formatMessage(shared.goToSlide, {
                number: i + 1,
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ItemsWrapper = ({ mobileCarousel, autoplay, showDots, children }) => {
  if (!mobileCarousel) {
    return <>{children}</>;
  }
  return (
    <MobileCarousel autoplay={autoplay} showDots={showDots}>
      {children}
    </MobileCarousel>
  );
};

// ─── Variation renderers ───────────────────────────────────────────────────

const NumberedItem = ({ item, index, iconPosition }) => {
  const href = getHref(item.link);
  const hasLink = !!href;

  // Optional coloured circle behind the number, same mechanism as the icon
  // variation's iconCircleColor. "none" (the default) leaves the plain number.
  const hasCircle = item.iconCircleColor && item.iconCircleColor !== 'none';
  const circleStyle = hasCircle
    ? {
        backgroundColor: item.iconCircleColor,
        ...getColorTextStyle(item.iconCircleColor),
      }
    : {};

  const inner = (
    <>
      {/* aria-hidden: the number is decorative sequencing, not a heading.
          Rendering it as a heading tag creates false h2 siblings alongside
          the block's own h2 header. Screen readers navigate by headings;
          decorative numbers must not appear in that outline. */}
      <div
        className={`content-row-item__number${hasCircle ? ' content-row-item__number--circle' : ''}`}
        aria-hidden="true"
        style={circleStyle}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="content-row-item__content">
        {item.preheader && (
          <p className="content-row-item__preheader">
            {safeString(item.preheader)}
          </p>
        )}
        {item.heading && (
          <h3 className="content-row-item__heading">
            {safeString(item.heading)}
          </h3>
        )}
        {item.text && (
          <RichText data={item.text} className="content-row-item__text" />
        )}
      </div>
    </>
  );

  const { style: bgStyle, toneClass: itemToneClass } = getCardBgStyle(item);
  const positionClass =
    iconPosition === 'left'
      ? ' content-row-item--left'
      : iconPosition === 'inline'
        ? ' content-row-item--inline'
        : '';

  return (
    <div
      className={`content-row-item content-row-item--numbered${positionClass}${itemToneClass ? ` ${itemToneClass}` : ''}`}
      style={
        bgStyle.backgroundColor
          ? {
              backgroundColor: bgStyle.backgroundColor,
              ...getColorTextStyle(bgStyle.backgroundColor),
            }
          : {}
      }
    >
      {hasLink ? (
        <a href={href} {...externalLinkProps(href)}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
};

const StatisticItem = ({ item, formatK, animationMs }) => {
  const { locale } = useIntl();
  const href = getHref(item.link);
  const hasLink = !!href;

  // Build the final formatted value string for screen readers.
  // The animated span is aria-hidden so screen readers don't try to announce
  // every intermediate count-up value. A visually-hidden span with the final
  // value is announced instead, giving a clean single reading.
  const finalValue =
    formatK && (item.value || 0) >= 1000
      ? `${Math.floor((item.value || 0) / 1000)}k`
      : formatNumber(item.value || 0, locale);
  const srLabel = [finalValue, safeString(item.suffix), safeString(item.label)]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <div className="content-row-item__stat-value">
        {/* aria-hidden: screen readers skip the animated counting number */}
        <span aria-hidden="true">
          <CountUp
            end={item.value || 0}
            duration={animationMs || 2000}
            formatK={formatK}
          />
          {item.suffix && (
            <span className="content-row-item__stat-suffix">
              {safeString(item.suffix)}
            </span>
          )}
        </span>
        {/* Visually hidden: announces the final value to screen readers */}
        <span className="visually-hidden">{srLabel}</span>
      </div>
      {item.label && (
        <div className="content-row-item__stat-label" aria-hidden="true">
          {safeString(item.label)}
        </div>
      )}
      {item.extraInfo && (
        <div className="content-row-item__stat-extra">
          {safeString(item.extraInfo)}
        </div>
      )}
    </>
  );

  return (
    <div className="content-row-item content-row-item--statistic">
      {hasLink ? (
        <a href={href} {...externalLinkProps(href)}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
};

// SVGs in icons/ go through Volto's svg-loader, which gives an
// { attributes, content } object (rendered with Volto's Icon); a React
// component (e.g. from @svgr) is rendered as such.
const CustomIcon = ({ icon }) =>
  typeof icon === 'function' ? (
    React.createElement(icon, { width: 32, height: 32 })
  ) : (
    <VoltoIcon name={icon} size="32px" />
  );

const IconItem = ({ item, iconPosition }) => {
  const LucideIcon = lucideIconMap[item.icon];
  const CustomSvg = !LucideIcon ? customSvgMap[item.icon] : null;
  const href = getHref(item.link);
  const hasLink = !!href;

  // Optional coloured circle behind the icon, picked from the same colour
  // list used for buttons. "none" (the default) leaves the icon as-is.
  const hasCircle = item.iconCircleColor && item.iconCircleColor !== 'none';
  const circleStyle = hasCircle
    ? {
        backgroundColor: item.iconCircleColor,
        ...getColorTextStyle(item.iconCircleColor),
      }
    : {};

  const inner = (
    <>
      <div
        className={`content-row-item__icon${hasCircle ? ' content-row-item__icon--circle' : ''}`}
        aria-hidden="true"
        style={circleStyle}
      >
        {LucideIcon ? (
          <LucideIcon size={32} strokeWidth={1.5} />
        ) : CustomSvg ? (
          <CustomIcon icon={CustomSvg} />
        ) : (
          <FallbackIcon size={32} strokeWidth={1.5} />
        )}
      </div>
      <div className="content-row-item__content">
        {item.preheader && (
          <p className="content-row-item__preheader">
            {safeString(item.preheader)}
          </p>
        )}
        {item.heading && (
          <h3 className="content-row-item__heading">
            {safeString(item.heading)}
          </h3>
        )}
        {item.text && (
          <RichText data={item.text} className="content-row-item__text" />
        )}
      </div>
    </>
  );

  const { style: bgStyle, toneClass: itemToneClass } = getCardBgStyle(item);
  const positionClass =
    iconPosition === 'left'
      ? ' content-row-item--left'
      : iconPosition === 'inline'
        ? ' content-row-item--inline'
        : '';

  return (
    <div
      className={`content-row-item content-row-item--icon${positionClass}${itemToneClass ? ` ${itemToneClass}` : ''}`}
      style={
        bgStyle.backgroundColor
          ? {
              backgroundColor: bgStyle.backgroundColor,
              ...getColorTextStyle(bgStyle.backgroundColor),
            }
          : {}
      }
    >
      {hasLink ? (
        <a href={href} {...externalLinkProps(href)}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
};

// A card's button. Visitors only see it when the card has a link; editors
// see a flagged "Add a link" button when there's button text but no link.
// `stretched` makes it the card's single link, covering the whole card
// (no link-inside-a-link).
const CardButton = ({ item, href, isEditMode, stretched = false }) => {
  const intl = useIntl();
  const { className: btnClass, style: btnStyle } = getButtonClasses(
    item.buttonStyle || '',
    'card-button',
  );
  if (!href) {
    return isEditMode && safeString(item.buttonText) ? (
      <span className={`${btnClass} block__unfinished`} style={btnStyle}>
        <EditHint isEditMode as="span">
          {intl.formatMessage(shared.addLink)}
        </EditHint>
      </span>
    ) : null;
  }
  return (
    <a
      href={href}
      className={
        stretched ? `${btnClass} content-row-item__stretched-link` : btnClass
      }
      style={btnStyle}
      {...externalLinkProps(href)}
    >
      {safeString(item.buttonText) || intl.formatMessage(shared.readMore)}
    </a>
  );
};

const ImageAboveItem = ({ item, isEditMode }) => {
  const {
    style: bgStyle,
    imageUrl,
    toneClass: itemToneClass,
  } = getCardBgStyle(item);
  const href = getHref(item.link);

  return (
    <div
      className={`content-row-item content-row-item--image-top${itemToneClass ? ` ${itemToneClass}` : ''}`}
      style={
        bgStyle.backgroundColor
          ? {
              backgroundColor: bgStyle.backgroundColor,
              ...getColorTextStyle(bgStyle.backgroundColor),
            }
          : {}
      }
    >
      {imageUrl && (
        <div className="content-row-item__image-top">
          {/* alt text uses the card heading. If heading is empty the image is
              treated as decorative (alt=""). Add a heading to every card that
              has a meaningful image — see schema field description. */}
          {/* eslint-disable-next-line no-restricted-syntax */}
          <img src={imageUrl} alt={safeString(item.heading)} />
        </div>
      )}
      <div className="content-row-item__body">
        {item.preheader && (
          <p className="content-row-item__preheader">
            {safeString(item.preheader)}
          </p>
        )}
        {item.heading && (
          <h3 className="content-row-item__heading">
            {safeString(item.heading)}
          </h3>
        )}
        {item.text && (
          <RichText data={item.text} className="content-row-item__text" />
        )}
        <CardButton item={item} href={href} isEditMode={isEditMode} />
      </div>
    </div>
  );
};

const ImageCardItem = ({ item, overlayStyle, isEditMode }) => {
  const {
    style: bgStyle,
    imageUrl,
    toneClass: itemToneClass,
  } = getCardBgStyle(item, { pictureBehind: true });
  const href = getHref(item.link);
  // No button style = the whole card is the link (older "arrow" cards).
  const wholeCard = !!href && !item.buttonStyle;
  const overlayId = overlayStyle || DEFAULT_OVERLAY;
  const overlayCss = overlayBackground(overlayId);

  const cardStyle = {};
  if (bgStyle.backgroundColor) {
    cardStyle.backgroundColor = bgStyle.backgroundColor;
    Object.assign(cardStyle, getColorTextStyle(bgStyle.backgroundColor));
  }

  const inner = (
    <>
      {imageUrl && (
        // aria-hidden: purely decorative background image.
        <div
          className="content-row-item__bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      {imageUrl && overlayCss && (
        <div
          className={`content-row-item__overlay content-row-item__overlay--${overlayId}`}
          aria-hidden="true"
          style={overlayCss}
        />
      )}
      <div className="content-row-item__body">
        {item.preheader && (
          <p className="content-row-item__preheader">
            {safeString(item.preheader)}
          </p>
        )}
        {item.heading && (
          <h3 className="content-row-item__heading">
            {safeString(item.heading)}
          </h3>
        )}
        {item.text && (
          <RichText data={item.text} className="content-row-item__text" />
        )}
        <CardButton
          item={item}
          href={href}
          isEditMode={isEditMode}
          stretched={wholeCard}
        />
      </div>
    </>
  );

  return (
    <div
      className={`content-row-item content-row-item--card${wholeCard ? ' content-row-item--whole-card' : ''}${itemToneClass ? ` ${itemToneClass}` : ''}`}
      style={cardStyle}
    >
      {inner}
      {wholeCard && (
        // Makes the whole card clickable with the mouse. Hidden from screen
        // readers and the keyboard: the card's button is the one real link
        // (no link wrapped around another link).
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a
          href={href}
          className="content-row-item__card-link"
          aria-hidden="true"
          tabIndex={-1}
          {...externalLinkProps(href)}
        />
      )}
    </div>
  );
};

// ─── Main View ─────────────────────────────────────────────────────────────

// The start screen lists the styles in the same order as the dropdown.
// Names and descriptions are messages.
const STYLE_DESCRIPTIONS = [
  { name: messages.modeNumbered, description: messages.startNumbered },
  { name: shared.icon, description: messages.startIcon },
  { name: messages.statistics, description: messages.startStatistics },
  { name: messages.modeCard, description: messages.startCard },
];

const View = (props) => {
  const { data = {} } = props;
  const intl = useIntl();
  // `displayMode` (was `variation`: VLT's CSS hides the fourth option of any
  // field with that id). Saved blocks are repaired as they load
  // (legacy/blocks.js repairCurrentBlock).
  const displayMode = data.displayMode || null;
  const items = (data.items || []).filter(
    (item) => item && typeof item === 'object',
  );

  // No style selected yet — start screen in edit mode, nothing in view mode.
  const isEditMode = isEditing(props);
  if (!displayMode) {
    if (!isEditMode) return null;
    return (
      <BlockWrapper {...props}>
        <BlockPlaceholder
          blockClass="content-row"
          prompt={intl.formatMessage(shared.selectStylePrompt)}
          modes={STYLE_DESCRIPTIONS.map(({ name, description }) => ({
            name: intl.formatMessage(name),
            description: intl.formatMessage(description),
          }))}
        />
      </BlockWrapper>
    );
  }

  // Background: a colour, and optionally an image over it (a photo, or a
  // pattern). The text follows the colour, as in a Hero's Section style.
  const backgroundColor = data.backgroundColor || 'transparent';
  const bgKey = colorValueToKey(backgroundColor);
  const bgImageUrl = getPickedImageUrl(data.backgroundImage);
  const isDark = isColorDark(backgroundColor);
  const bgOverlay = data.backgroundOverlay || DEFAULT_OVERLAY;
  const bgOverlayCss = overlayBackground(bgOverlay);
  const wrapperStyle =
    backgroundColor && backgroundColor !== 'transparent'
      ? { backgroundColor, ...getColorTextStyle(backgroundColor) }
      : {};

  // Header
  const headerAlignment = data.headerAlignment || 'left';
  const itemsAlignment = data.itemsAlignment || 'left';
  // Anchor for same-page links, kept exactly as before so links on live
  // pages keep working: the suffix comes from `props.block`, which only the
  // editor passes.
  const anchorId = data.headerText
    ? blockAnchorId(data.headerText, props.block)
    : undefined;
  // Separate ID for the heading element — used by aria-labelledby on the section wrapper.
  const headingId = data.headerText
    ? `cr-heading-${props.block || 'block'}`
    : undefined;

  // View All button
  const viewAllHref = getHref(data.viewAllUrl);
  const viewAllPosition = data.viewAllPosition || 'header';
  const showViewAllButton = !!data.showViewAll && !!viewAllHref;
  // Switched on but no link yet: editors see a flagged button.
  const viewAllUnfinished = !!data.showViewAll && !viewAllHref && isEditMode;
  const { className: viewAllClass, style: viewAllBtnStyle } = getButtonClasses(
    data.viewAllStyle || '',
    'button',
  );

  // Layout
  const columns = data.columns || (displayMode === 'icon' ? 4 : 3);
  const sideBySideLayout = !!data.sideBySideLayout;

  // Block image (header)
  const blockImageUrl = getImageUrl(data.blockImage);
  const blockImagePosition = data.blockImagePosition || 'below';
  const hasSideImage = !!blockImageUrl && blockImagePosition === 'side';

  // Wrapper classes
  const paddingTop = data.paddingTop || 'default';
  const paddingBottom = data.paddingBottom || 'default';
  const wrapperClasses = [
    'content-row',
    `content-row--${displayMode}`,
    bgKey && bgKey !== 'transparent' ? `bg-${bgKey}` : '',
    isDark ? 'bg-dark' : backgroundColor !== 'transparent' ? 'bg-light' : '',
    bgImageUrl ? 'content-row--has-bg' : '',
    data.mobileCarousel ? 'content-row--mobile-scroll' : '',
    `content-row--pad-top-${paddingTop}`,
    `content-row--pad-bottom-${paddingBottom}`,
    data.customClass || '',
  ]
    .filter(Boolean)
    .join(' ');

  const sideBySideAlign = data.sideBySideAlign || 'top';

  // Column width ratio for side-by-side layout. Set as CSS custom properties
  // rather than an inline flex value directly — the properties only get
  // consumed inside the desktop media query in style.css, so they can't
  // affect the stacked mobile layout (where the header/items are flex
  // children on the vertical axis instead).
  const sideBySideRatioMap = {
    '50-50': [50, 50],
    '25-75': [25, 75],
    '75-25': [75, 25],
    '40-60': [40, 60],
    '60-30': [60, 30],
  };
  const [headerRatio, itemsRatio] =
    sideBySideRatioMap[data.sideBySideRatio] || sideBySideRatioMap['50-50'];

  const innerClasses = [
    'content-row__inner',
    sideBySideLayout ? 'content-row__inner--side-by-side' : '',
    sideBySideLayout && sideBySideAlign === 'middle'
      ? 'content-row__inner--align-middle'
      : '',
    sideBySideLayout && sideBySideAlign === 'bottom'
      ? 'content-row__inner--align-bottom'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const innerStyle = sideBySideLayout
    ? {
        '--content-row-header-ratio': headerRatio,
        '--content-row-items-ratio': itemsRatio,
      }
    : undefined;

  const renderItem = (item, index) => {
    switch (displayMode) {
      case 'numbered':
        return (
          <NumberedItem
            key={index}
            item={item}
            index={index}
            iconPosition={data.iconPosition}
          />
        );
      case 'statistics':
        return (
          <StatisticItem
            key={index}
            item={item}
            formatK={data.statsFormatK}
            animationMs={parseInt(data.statAnimationMs, 10) || undefined}
          />
        );
      case 'icon':
        return (
          <IconItem key={index} item={item} iconPosition={data.iconPosition} />
        );

      case 'card':
        return data.imageCardStyle === 'above' ? (
          <ImageAboveItem key={index} item={item} isEditMode={isEditMode} />
        ) : (
          <ImageCardItem
            key={index}
            item={item}
            overlayStyle={data.overlayStyle}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  };

  // The "View all" button: shown with a link, flagged for editors without.
  const viewAllButton =
    showViewAllButton || viewAllUnfinished ? (
      <a
        href={viewAllHref || undefined}
        className={
          viewAllUnfinished ? `${viewAllClass} block__unfinished` : viewAllClass
        }
        style={viewAllBtnStyle}
        {...externalLinkProps(viewAllHref)}
      >
        {viewAllUnfinished ? (
          <EditHint isEditMode as="span">
            {intl.formatMessage(shared.addLink)}
          </EditHint>
        ) : (
          data.viewAllText || intl.formatMessage(shared.viewAll)
        )}
      </a>
    ) : null;

  const hasHeader = !!(
    data.preheaderText ||
    data.headerText ||
    data.descriptionText ||
    blockImageUrl ||
    (viewAllButton && viewAllPosition === 'header')
  );

  // Nothing to show: visitors see nothing (no empty band); editors see the
  // prompt to add the first item, under any heading they've written.
  if (items.length === 0 && !isEditMode && !hasHeader) return null;

  return (
    <BlockWrapper
      {...props}
      className={[
        `type-${displayMode}`,
        `align-${headerAlignment}`,
        backgroundColor !== 'transparent'
          ? `tone-${isDark ? 'light' : 'dark'}`
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* section + aria-labelledby gives screen reader users a named
          landmark. Only applied when a heading is present. */}
      <section
        id={anchorId}
        className={wrapperClasses}
        style={wrapperStyle}
        {...(headingId ? { 'aria-labelledby': headingId } : {})}
      >
        {bgImageUrl && (
          <>
            {/* aria-hidden: purely decorative background image. */}
            <div
              className="content-row__bg"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${bgImageUrl})`,
                backgroundPosition: data.backgroundPosition || 'center',
              }}
            />
            {bgOverlayCss && (
              <div
                className={`content-row__overlay content-row__overlay--${bgOverlay}`}
                aria-hidden="true"
                style={bgOverlayCss}
              />
            )}
          </>
        )}
        <div className={innerClasses} style={innerStyle}>
          {/* Header section */}
          {hasHeader && (
            <div className={`content-row__header align-${headerAlignment}`}>
              <div
                className={`content-row__header-text${hasSideImage ? ' content-row__header-text--image-side' : ''}`}
              >
                <div className="content-row__header-text-inner">
                  {data.preheaderText && (
                    <div className="content-row__preheader">
                      {safeString(data.preheaderText)}
                    </div>
                  )}
                  {data.headerText && (
                    // id ties this heading to the section aria-labelledby.
                    <h2 className="content-row__heading" id={headingId}>
                      {safeString(data.headerText)}
                    </h2>
                  )}
                  {data.descriptionText && (
                    <p className="content-row__description">
                      {safeString(data.descriptionText)}
                    </p>
                  )}
                </div>
                {blockImageUrl && (
                  <div
                    className={`content-row__block-image content-row__block-image--${blockImagePosition}`}
                  >
                    {/* alt uses the block heading; decorative (alt="") when
                        no heading is set, matching the image-above card. */}
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <img
                      src={blockImageUrl}
                      alt={safeString(data.headerText)}
                    />
                  </div>
                )}
              </div>
              {viewAllPosition === 'header' && viewAllButton}
            </div>
          )}

          {/* Items */}
          {items.length > 0 ? (
            <div className="content-row__items">
              {/* Normal grid — hidden on mobile when carousel is active */}
              <div
                className={`content-row__grid align-${itemsAlignment} columns-${columns}`}
              >
                {items.map((item, index) => renderItem(item, index))}
              </div>
              {/* Embla mobile carousel — only shown on mobile */}
              {data.mobileCarousel && (
                <ItemsWrapper
                  mobileCarousel={true}
                  autoplay={data.mobileAutoplay}
                  showDots={data.mobileDots}
                >
                  {items.map((item, index) => renderItem(item, index))}
                </ItemsWrapper>
              )}
            </div>
          ) : (
            isEditMode && (
              <BlockPlaceholder
                blockClass="content-row"
                prompt={intl.formatMessage(
                  displayMode === 'statistics'
                    ? messages.noStatistics
                    : messages.noItems,
                )}
              />
            )
          )}

          {viewAllButton && viewAllPosition === 'below' && (
            <div
              className={`content-row__view-all-bottom align-${headerAlignment}`}
            >
              {viewAllButton}
            </div>
          )}
        </div>
      </section>
    </BlockWrapper>
  );
};

export default View;
