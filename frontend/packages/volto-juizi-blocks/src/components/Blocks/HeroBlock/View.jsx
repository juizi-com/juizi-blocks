import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers';
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
import { overlayStyleToRgba } from '../_shared/overlays';
import { blockAnchorId } from '../_shared/anchors';
import { formatDate } from '../_shared/format';
import shared from '../_shared/messages';
import messages from './messages';
import './style.css';

// ─── Helpers ───────────────────────────────────────────────────────────────

// Resolve the best available page image URL.
// Priority: preview_image_link → preview_image → image (lead image)
const getPreviewImageUrl = (properties) => {
  const baseUrl = flattenToAppURL(properties?.['@id'] || '');
  const linked = properties?.preview_image_link;
  if (linked?.['@id']) {
    const linkedBase = flattenToAppURL(linked['@id']);
    const scales = linked?.image_scales?.image?.[0]?.scales;
    if (scales?.large?.download)
      return `${linkedBase}/${scales.large.download}`;
    return `${linkedBase}/@@images/image/large`;
  }
  if (properties?.preview_image)
    return `${baseUrl}/@@images/preview_image/large`;
  if (properties?.image) return `${baseUrl}/@@images/image/large`;
  return '';
};

// Format an Event item's start/end dates and location into a single line,
// e.g. "13 - 14 Nov 2024 | Cape Town" or "13 Nov - 25 Dec 2024 | Cape Town".
// Mirrors the showPublicationDate approach below: date-only (no time), since
// that's what the preheader slot is for. Falls back to a single date when
// there's no end date, the event is open-ended, or start and end fall on
// the same day.
const formatEventDetails = (properties, language) => {
  const rawStart = properties?.start;
  if (!rawStart) return '';

  const start = new Date(rawStart);
  const end = properties?.end ? new Date(properties.end) : null;
  const isOpenEnded = properties?.open_end || !end;
  const sameDay = end && start.toDateString() === end.toDateString();

  const day = (d) => d.getDate();
  const month = (d) => formatDate(d, { month: 'short' }, language);
  const year = (d) => d.getFullYear();

  let dateText;
  if (isOpenEnded || sameDay) {
    dateText = `${day(start)} ${month(start)} ${year(start)}`;
  } else if (year(start) === year(end)) {
    dateText =
      month(start) === month(end)
        ? `${day(start)} - ${day(end)} ${month(end)} ${year(end)}`
        : `${day(start)} ${month(start)} - ${day(end)} ${month(end)} ${year(end)}`;
  } else {
    dateText = `${day(start)} ${month(start)} ${year(start)} - ${day(end)} ${month(end)} ${year(end)}`;
  }

  const location = properties?.location?.trim();
  return location ? `${dateText} | ${location}` : dateText;
};

// Slugify heading text into a stable, deduped element id.
const slugifyHeadingText = (text, seen) => {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '') || 'section';
  const count = seen[base] || 0;
  seen[base] = count + 1;
  return count === 0 ? `toc-${base}` : `toc-${base}-${count}`;
};

// Blocks-layout headings, found without needing to know any block's schema
// or any Volto wrapper class name. Two earlier attempts at this both
// guessed wrong for this install — a specific wrapper class
// (`.blocks-group-wrapper`) and a standalone Heading block's field names
// (`title`/`level`) — so this instead climbs the DOM from this block's own
// element until it finds an ancestor whose subtree contains at least one
// other heading, and treats that ancestor as "the blocks layout". That
// ancestor is whatever Volto actually calls it in this rendering context
// (edit and view commonly differ), which this never needs to know. Capped
// at a handful of levels, falling back to document.body if nothing turns
// up closer in — broader than ideal, but still correct, just potentially
// picking up headings from elsewhere on the page (theme chrome, etc.) in
// that fallback case.
// A Listing or Search block renders each result item's own title as a
// heading (h2 in every core Volto template, whichever the editor picked) —
// that's a content-item title, not a structural section heading, and must
// never feed the TOC. Volto wraps every block's rendered output in
// `.block.<type>` regardless of template, so this catches all listing/search
// variants without needing to know a specific template's markup — the same
// reasoning that ruled out guessing a wrapper class for "the blocks layout"
// container above, just applied to identifying a block's type instead.
const isListingOrSearchHeading = (el) =>
  !!el.closest('.block.listing, .block.search');

// A heading's visible text. Volto adds a "copy link" anchor to headings for
// logged-in users in view mode, holding a <style> element and an icon; their
// text would otherwise end up in the button label. Read from a copy with
// such helper elements removed.
const HEADING_HELPERS = 'style, script, svg, .anchor, [aria-hidden="true"]';
export const headingText = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll(HEADING_HELPERS).forEach((node) => node.remove());
  return (copy.textContent || '').replace(/\s+/g, ' ').trim();
};

function useBlockLayoutHeadingTOC({
  enabled,
  selfBlockId,
  useH2,
  useH3,
  selfRef,
}) {
  const [entries, setEntries] = useState([]);
  const signatureRef = useRef('');
  const MAX_HOPS = 6;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      setEntries([]);
      return undefined;
    }
    const selfEl = selfRef.current;
    if (!selfEl) {
      setEntries([]);
      return undefined;
    }

    const tagSelector = [
      ...(useH2 ? ['h2'] : []),
      ...(useH3 ? ['h3'] : []),
    ].join(',');
    if (!tagSelector) {
      setEntries([]);
      return undefined;
    }

    // Listing/search headings don't count as "another heading" either —
    // otherwise a listing block sitting between two sparse sections could
    // make the climb stop one level too early, on a container too narrow to
    // hold the actual section heading it should have found.
    const hasOtherHeading = (el) =>
      Array.from(el.querySelectorAll(tagSelector)).some(
        (h) =>
          h.getAttribute('data-hero-self-id') !== selfBlockId &&
          !isListingOrSearchHeading(h),
      );

    let container = selfEl.parentElement;
    let hops = 0;
    while (container && hops < MAX_HOPS && !hasOtherHeading(container)) {
      container = container.parentElement;
      hops += 1;
    }
    if (!container) container = document.body;

    const scan = () => {
      const seen = {};
      const found = Array.from(container.querySelectorAll(tagSelector))
        .filter(
          (el) =>
            el.getAttribute('data-hero-self-id') !== selfBlockId &&
            !isListingOrSearchHeading(el),
        )
        .map((el) => {
          const text = headingText(el);
          if (!text) return null;
          if (!el.id) el.id = slugifyHeadingText(text, seen);
          return { id: el.id, title: text };
        })
        .filter(Boolean);

      const signature = JSON.stringify(found.map((f) => [f.id, f.title]));
      if (signature === signatureRef.current) return;
      signatureRef.current = signature;
      setEntries(found);
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled, selfBlockId, useH2, useH3, selfRef]);

  return entries;
}

// Wrap each word in a span with positional and identity classes.
// Enables CSS to target first/last words or specific words by name.
// Single-word strings only receive hero-word--first (not --last as well).
const wrapWordsInSpans = (text) => {
  if (!text) return text;
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return text;
  return words.map((word, i) => {
    const isFirst = i === 0;
    const isLast = i === words.length - 1;
    const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const classes = [
      'hero-word',
      isFirst ? 'hero-word--first' : '',
      isLast && words.length > 1 ? 'hero-word--last' : '',
      slug ? `hero-word--${slug}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <React.Fragment key={i}>
        <span className={classes}>{word}</span>
        {i < words.length - 1 && <span className="hero-word__space"> </span>}
      </React.Fragment>
    );
  });
};

// ─── Sub-components ────────────────────────────────────────────────────────

// Decorative arrow shown after a button's label when the editor enables
// "Show arrow icon". Sized in em so it scales with the button's own
// font-size (including the small-buttons variant), and coloured via
// currentColor so it always matches the button's text colour automatically
// — no separate colour config needed.
const ButtonArrow = () => (
  <svg
    className="hero-button__arrow"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Breadcrumbs = ({ items }) => {
  const intl = useIntl();
  if (!items?.length) return null;
  const crumbs = [
    { url: '/', title: intl.formatMessage(shared.home) },
    ...items,
  ];
  // data-depth reflects how many crumbs render, including the current page.
  // CSS uses this to hide the nav when depth is 2 (Home + current page only —
  // no meaningful trail). Themes can override with [data-depth="2"] { display: flex }.
  return (
    // nav + aria-label makes this a named landmark, distinct from any other
    // navigation on the page. Screen reader users can jump to it directly.
    <nav
      aria-label={intl.formatMessage(shared.breadcrumb)}
      className="hero-breadcrumbs"
      data-depth={crumbs.length}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i}>
            {isLast ? (
              // Current page: not a link, aria-current tells screen readers
              // this is where the user is now. Hidden via CSS by default —
              // override .hero-breadcrumbs [aria-current="page"] in your theme
              // if you want it visible.
              <span aria-current="page">{crumb.title}</span>
            ) : (
              <a href={crumb.url === '/' ? '/' : flattenToAppURL(crumb.url)}>
                {crumb.title}
              </a>
            )}
            {!isLast && <span aria-hidden="true"> / </span>}
          </span>
        );
      })}
    </nav>
  );
};

// A button's text: its label, else its link's title. Visitors never see a
// button without both a link and a text; editors see it flagged instead.
const buttonLabel = (btn) => {
  const link = Array.isArray(btn.link) ? btn.link[0] : btn.link;
  return btn.label?.trim() || link?.title || '';
};

// A message (format it with `intl`), or null when the button is finished.
const unfinishedHint = (href, label) =>
  !href ? shared.addLink : !label ? shared.addLabel : null;

// "Use smaller buttons": the shared btn-small modifier (config/buttons.scss).
// A Hero-only rule lost to the shared button base, so it never showed.
const withSize = (classes, smallButtons) =>
  smallButtons ? `${classes} btn-small` : classes;

const HeroButtons = ({
  buttons: allButtons,
  displayMode,
  tocEntries,
  smallButtons,
  tocButtonStyle,
  isEditMode,
  showUnfinished,
}) => {
  const intl = useIntl();
  const wrapperClass = `hero-buttons${smallButtons ? ' hero-buttons--small' : ''}`;
  // Unfinished buttons (no link or no text) are left out for visitors. For
  // editors they're flagged ("Add a link") only while the Hero has nothing
  // else in it: with text or a finished button already there, the prompt
  // read as a request to add something the editor may not want.
  const buttons = allButtons
    .map((btn) => {
      const href = getHref(btn.link);
      const label = buttonLabel(btn);
      return { btn, href, label, hint: unfinishedHint(href, label) };
    })
    .filter(({ hint }) => (isEditMode && showUnfinished) || !hint);
  if (displayMode !== 'toc' && buttons.length === 0) return null;

  if (displayMode === 'toc') {
    const { className: btnClass, style: btnStyle } = getButtonClasses(
      tocButtonStyle || '',
      'hero-button',
    );
    if (tocEntries.length === 0) {
      // Only show feedback in edit mode — no output on the live site
      if (!isEditMode) return null;
      return (
        <div className="hero-buttons hero-buttons--toc-empty">
          <EditHint isEditMode={isEditMode} as="span">
            {intl.formatMessage(messages.tocEmpty)}
          </EditHint>
        </div>
      );
    }
    return (
      <div className={wrapperClass}>
        {tocEntries.map((entry, i) => (
          <a
            key={i}
            href={`#${entry.id}`}
            className={withSize(btnClass, smallButtons)}
            style={btnStyle}
          >
            {entry.title}
          </a>
        ))}
      </div>
    );
  }

  if (displayMode === 'list') {
    return (
      <div className="hero-buttons hero-buttons--list">
        {buttons.map(({ btn, href, label, hint }, i) => {
          return (
            <React.Fragment key={i}>
              <a
                href={href || undefined}
                className={hint ? 'block__unfinished' : undefined}
                {...externalLinkProps(href)}
              >
                {hint ? (
                  <EditHint isEditMode={isEditMode} as="span">
                    {intl.formatMessage(hint)}
                  </EditHint>
                ) : (
                  label
                )}
                {btn.showArrow && <ButtonArrow />}
              </a>
              {i < buttons.length - 1 && <span aria-hidden="true"> | </span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Default: styled buttons
  return (
    <div className={wrapperClass}>
      {buttons.map(({ btn, href, label, hint }, i) => {
        const { className: styleClass, style: btnStyle } = getButtonClasses(
          btn.buttonStyle || '',
          'hero-button',
        );
        const btnClass = withSize(styleClass, smallButtons);
        return (
          <a
            key={i}
            href={href || undefined}
            className={hint ? `${btnClass} block__unfinished` : btnClass}
            style={btnStyle}
            {...externalLinkProps(href)}
          >
            {hint ? (
              <EditHint isEditMode={isEditMode} as="span">
                {intl.formatMessage(hint)}
              </EditHint>
            ) : (
              label
            )}
            {btn.showArrow && <ButtonArrow />}
          </a>
        );
      })}
    </div>
  );
};

// The words of the note shown above the page's Title block in the editor
// while this Hero is the primary heading. The note itself is drawn by
// style.css (`.block.title::before`), which can't be translated, so its text
// is handed over as a CSS variable, in the editor's language.
const cssString = (text) =>
  `"${text.replace(/[\\"]/g, '\\$&').replace(/</g, '\\3c ')}"`;

const TitleHiddenNote = () => {
  const intl = useIntl();
  const note = cssString(intl.formatMessage(messages.titleHiddenNote));
  return (
    <style
      // Our own message, escaped for CSS above.
      dangerouslySetInnerHTML={{
        __html: `:root{--juizi-hero-title-note:${note}}`,
      }}
    />
  );
};

// ─── HeroContent ───────────────────────────────────────────────────────────

const HeroContent = ({
  data,
  TitleTag,
  headingId,
  selfBlockId,
  displayTitle,
  displaySubtitle,
  displayPreheader,
  tocEntries,
  showBreadcrumbs,
  breadcrumbItems,
  logoUrl,
  sideImageUrl,
  sideImageAlt,
  sideImageAlignment,
  sideImageMobile,
  isEditMode,
  hideTitle,
  otherPrimaryHeading,
}) => {
  const intl = useIntl();
  const buttonsDisplayMode = data.buttonsDisplayMode || 'buttons';
  const hasButtons =
    buttonsDisplayMode === 'toc'
      ? tocEntries.length > 0
      : data.buttons?.length > 0;

  const hasSideImage = !!sideImageUrl;
  // The side slot can only hold one thing. Locked to 'above-title' here as
  // a render-time safety net (schema.js already restricts the field choices,
  // but this keeps stale/API-written data from rendering a collision).
  const logoPosition = hasSideImage
    ? 'above-title'
    : data.logoPosition || 'above-title';
  const hasBesideLogo =
    logoUrl && !hasSideImage && logoPosition === 'beside-content';
  const contentBlock = (
    <div className="hero-content">
      {showBreadcrumbs && <Breadcrumbs items={breadcrumbItems} />}
      {logoUrl && logoPosition === 'above-title' && (
        <div className={`hero-logo hero-logo--${data.logoSize || 'medium'}`}>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <img src={logoUrl} alt="" />
        </div>
      )}
      {displayPreheader && (
        <div className="hero-preheader">
          {wrapWordsInSpans(displayPreheader)}
        </div>
      )}
      <EditHint isEditMode={isEditMode && !displayTitle}>
        {intl.formatMessage(messages.addHeading)}
      </EditHint>
      <EditHint
        isEditMode={isEditMode && otherPrimaryHeading}
        tone="warning"
        live
      >
        {intl.formatMessage(messages.otherPrimary)}
      </EditHint>
      {displayTitle && (
        // id ties this heading to the section's aria-labelledby.
        // visually-hidden class hides it on screen when hideTitle is true
        // while keeping it in the document outline for screen readers.
        <TitleTag
          id={headingId}
          data-hero-self-id={selfBlockId}
          className={hideTitle ? 'hero-title visually-hidden' : 'hero-title'}
        >
          {wrapWordsInSpans(displayTitle)}
        </TitleTag>
      )}
      {!data.horizontalLayout && displaySubtitle && (
        <div className="hero-subtitle">{displaySubtitle}</div>
      )}
    </div>
  );

  // Anything a visitor would see: text, or a button with a link and a text.
  const hasFinishedButton = (data.buttons || []).some(
    (btn) => getHref(btn.link) && buttonLabel(btn),
  );
  const heroHasContent = !!(
    displayTitle ||
    displaySubtitle ||
    displayPreheader ||
    hasFinishedButton
  );

  const buttonsBlock =
    hasButtons || (buttonsDisplayMode === 'toc' && isEditMode) ? (
      <HeroButtons
        buttons={data.buttons || []}
        displayMode={buttonsDisplayMode}
        tocEntries={tocEntries}
        smallButtons={data.smallButtons}
        tocButtonStyle={data.tocButtonStyle}
        isEditMode={isEditMode}
        showUnfinished={!heroHasContent}
      />
    ) : null;

  // Side image: a larger content image beside the text, distinct from the
  // Logo (small brand mark). Takes priority over the legacy beside-content
  // logo slot — the two are mutually exclusive by the time data gets here.
  if (hasSideImage) {
    const sideLayoutClasses = [
      'hero-inner__side-layout',
      `hero-inner__side-layout--align-${sideImageAlignment}`,
    ]
      .filter(Boolean)
      .join(' ');
    const sideImageClasses = [
      'hero-side-image',
      `hero-side-image--mobile-${sideImageMobile}`,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={sideLayoutClasses}>
        <div className="hero-inner__side-content">
          {contentBlock}
          {data.horizontalLayout && displaySubtitle && (
            <div className="hero-subtitle">{displaySubtitle}</div>
          )}
          {buttonsBlock}
        </div>
        <div className={sideImageClasses}>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <img src={sideImageUrl} alt={sideImageAlt || ''} />
        </div>
      </div>
    );
  }

  if (hasBesideLogo) {
    return (
      <div className="hero-inner__beside-logo">
        <div className="hero-inner__beside-logo-content">
          {contentBlock}
          {data.horizontalLayout && displaySubtitle && (
            <div className="hero-subtitle">{displaySubtitle}</div>
          )}
          {buttonsBlock}
        </div>
        <div
          className={`hero-logo hero-logo--beside hero-logo--${data.logoSize || 'medium'}`}
        >
          {/* eslint-disable-next-line no-restricted-syntax */}
          <img src={logoUrl} alt="" />
        </div>
      </div>
    );
  }

  if (data.horizontalLayout) {
    return (
      <>
        {contentBlock}
        <div className="hero-inner__horizontal-right">
          {displaySubtitle && (
            <div className="hero-subtitle">{displaySubtitle}</div>
          )}
          {buttonsBlock}
        </div>
      </>
    );
  }

  return (
    <>
      {contentBlock}
      {buttonsBlock}
    </>
  );
};

// ─── Main View ─────────────────────────────────────────────────────────────

const View = (props) => {
  const { data = {}, properties = {} } = props;
  const selfBlockId = props.block || props.id;
  const intl = useIntl();
  const breadcrumbItems = useSelector(
    (state) => state.breadcrumbs?.items || [],
  );

  // Blocks-layout headings — see useBlockLayoutHeadingTOC above.
  const wantsToc = (data.buttonsDisplayMode || 'buttons') === 'toc';
  const selfRef = useRef(null);
  const blockLayoutTocEntries = useBlockLayoutHeadingTOC({
    enabled: wantsToc,
    selfBlockId,
    useH2: data.useH2 ?? true,
    useH3: data.useH3 ?? true,
    selfRef,
  });

  // No display style yet — placeholder in edit mode, nothing in view mode.
  const isEditMode = isEditing(props);
  if (!data.blockMode) {
    if (!isEditMode) return null;
    return (
      <BlockWrapper {...props}>
        <BlockPlaceholder
          blockClass="hero-block"
          prompt={intl.formatMessage(shared.selectStylePrompt)}
          modes={[
            {
              name: 'Hero',
              description: intl.formatMessage(messages.startHero),
            },
            {
              name: intl.formatMessage(messages.section),
              description: intl.formatMessage(messages.startSection),
            },
          ]}
        />
      </BlockWrapper>
    );
  }

  const blockMode = data.blockMode || 'hero';
  const isHeroMode = blockMode === 'hero';

  // ── Derive display values ───────────────────────────────────────────────
  const pageTitle = properties?.title || '';
  const pageDescription = properties?.description || '';

  let displayTitle = data.title || '';
  let displaySubtitle = data.subtitle || '';
  let displayPreheader = data.preheader || '';

  // usePageTitle and usePageDescription apply to both modes
  if (data.usePageTitle !== false) displayTitle = pageTitle;
  if (data.usePageDescription !== false) displaySubtitle = pageDescription;

  // showPublicationDate fills the preheader with the publication date only when
  // the editor has not set a manual preheader. If both are set, the manual text wins.
  // Available in both modes.
  if (data.showPublicationDate && properties?.effective && !data.preheader) {
    displayPreheader = formatDate(properties.effective, undefined, intl.locale);
  }

  // showEventDetails fills the preheader with the event's date range and
  // location (e.g. "13 - 14 Nov 2024 | Cape Town"), same manual-preheader
  // priority rule as above. Only produces output on Event items, since
  // formatEventDetails no-ops without a start date. Checked after
  // showPublicationDate so that on an Event item with both switched on,
  // event details — the more specific, more useful line — wins.
  if (data.showEventDetails && properties?.start && !data.preheader) {
    displayPreheader = formatEventDetails(properties, intl.locale);
  }

  // ── Background image (both modes) ───────────────────────────────────────
  let imageUrl = '';
  if (data.usePreviewImage) {
    imageUrl = getPreviewImageUrl(properties);
  } else {
    const img = data.backgroundImage?.[0];
    imageUrl = img ? `${flattenToAppURL(img['@id'])}/@@images/image` : '';
  }

  // ── Background video (hero mode only) ───────────────────────────────────
  let videoUrl = null;
  if (isHeroMode) {
    const rawId = data.backgroundVideo?.[0]?.['@id'] || '';
    if (rawId) {
      const filename = rawId.split('/').filter(Boolean).pop();
      const isDownloadUrl = rawId.includes('/@@download/');
      videoUrl = filename
        ? isDownloadUrl
          ? rawId
          : `${rawId}/@@download/file/${filename}`
        : null;
    }
  }

  const overlayStyle = data.overlayStyle || 'gradient';
  const overlayRgba = overlayStyleToRgba(overlayStyle);
  const showGradient = overlayStyle === 'gradient' && (imageUrl || videoUrl);
  const backgroundPosition = data.backgroundPosition || 'center';

  // ── Background color (section mode) ───────────────────────────────────
  const backgroundColor = data.backgroundColor || 'transparent';
  const bgKey = colorValueToKey(backgroundColor);
  const isDark = isColorDark(backgroundColor);

  // ── Logo ───────────────────────────────────────────────────────────────
  const logoImage = data.heroLogo?.[0];
  const logoUrl =
    isHeroMode && logoImage
      ? `${flattenToAppURL(logoImage['@id'])}/@@images/image`
      : null;

  // ── Side image (both modes) ─────────────────────────────────────────────
  // A larger content image beside the text — distinct from the Logo above.
  const sideImageMedia = data.sideImage?.[0];
  const sideImageUrl = sideImageMedia
    ? `${flattenToAppURL(sideImageMedia['@id'])}/@@images/image`
    : null;

  // ── TOC ────────────────────────────────────────────────────────────────
  // Headings from the blocks layout (computed earlier via
  // useBlockLayoutHeadingTOC), in page order.
  const tocEntries =
    data.buttonsDisplayMode === 'toc' ? blockLayoutTocEntries : [];

  // ── Heading level and wrapper element ─────────────────────────────────
  // isPrimaryHeading: editor declares this block is the main page heading.
  // Drives h1 (vs h2) and gives the section a stronger landmark label.
  // hideTitle: title is used for accessibility labelling but not displayed
  // visually — useful when a background image or design makes a heading
  // redundant on screen but it must still exist in the document outline.
  const isPrimaryHeading = data.isPrimaryHeading || false;
  const hideTitle = data.hideTitle || false;
  const TitleTag = isPrimaryHeading ? 'h1' : 'h2';

  // The block always renders as <section>. This gives screen reader users
  // a named landmark they can jump to via the heading reference.
  // aria-labelledby is only applied when a title is actually rendering —
  // a <section> with no accessible name is valid but some validators flag it.
  const headingId = displayTitle ? `hero-heading-${selfBlockId}` : undefined;

  // ── Classes ────────────────────────────────────────────────────────────
  const alignment = data.alignment || 'left';
  const paddingTop = data.paddingTop || 'default';
  const paddingBottom = data.paddingBottom || 'default';
  const showBreadcrumbs = data.showBreadcrumbs && breadcrumbItems.length > 0;

  // The page's own title/date and breadcrumbs are hidden with CSS
  // (body:has(.hero-block--primary-heading) …, see style.css) rather than by
  // changing <body> classes during render: correct in server-rendered HTML,
  // for any number of Hero blocks, and it cleans up by itself.

  // In the editor, warn when another Hero on the page is also the primary
  // heading (there should be one h1 per page).
  const otherPrimaryHeading =
    isEditMode &&
    isPrimaryHeading &&
    Object.entries(properties?.blocks || {}).some(
      ([id, block]) =>
        id !== selfBlockId &&
        block?.['@type'] === 'juiziHero' &&
        block?.blockMode &&
        block?.isPrimaryHeading,
    );

  // Anchor ID from the block title for same-page linking. Kept exactly as
  // before so links to it on live pages keep working: the suffix comes from
  // `props.block`, which only the editor passes (the published page passes
  // `id`), so live anchors are the plain slug.
  const blockId = data.title
    ? blockAnchorId(data.title, props.block)
    : undefined;

  const wrapperClasses = [
    'hero-block',
    `hero-block--${blockMode}`,
    isPrimaryHeading ? 'hero-block--primary-heading' : '',
    showBreadcrumbs ? 'hero-block--has-breadcrumbs' : '',
    data.isFullWidth ? 'hero-block--full-width' : '',
    `hero-block--pad-top-${paddingTop}`,
    `hero-block--pad-bottom-${paddingBottom}`,
    !isHeroMode && bgKey ? `bg-${bgKey}` : '',
    !isHeroMode ? (isDark ? 'bg-dark' : 'bg-light') : '',
    imageUrl || videoUrl ? 'hero-block--has-bg' : '',
    sideImageUrl ? 'hero-block--has-side-image' : '',
    data.horizontalLayout ? 'hero-block--horizontal' : '',
    data.customClass || '',
  ]
    .filter(Boolean)
    .join(' ');

  const innerClasses = [
    'hero-block__inner',
    `hero-block__inner--align-${alignment}`,
    data.horizontalLayout ? 'hero-block__inner--horizontal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperStyle =
    !isHeroMode && backgroundColor && backgroundColor !== 'transparent'
      ? { backgroundColor, ...getColorTextStyle(backgroundColor) }
      : {};

  return (
    // section + aria-labelledby gives screen reader users a named landmark
    // they can navigate to directly. Only applied when a heading is present;
    // falls back to a plain section without a label when no title renders.
    <BlockWrapper
      {...props}
      className={[
        `type-${blockMode}`,
        `align-${alignment}`,
        `tone-${!isHeroMode ? (isDark ? 'light' : 'dark') : 'light'}`,
      ].join(' ')}
    >
      {isEditMode && isPrimaryHeading && <TitleHiddenNote />}
      <section
        ref={selfRef}
        id={blockId}
        className={wrapperClasses}
        style={wrapperStyle}
        {...(headingId ? { 'aria-labelledby': headingId } : {})}
      >
        {/* Background layers — image (both modes) / video (hero only) */}
        {(imageUrl || videoUrl) && (
          <>
            {videoUrl ? (
              // aria-hidden: purely decorative background video.
              // data-reducemotion: CSS targets this to pause the video when
              // the user has requested reduced motion in their OS settings.
              <video
                className="hero-block__video-bg"
                autoPlay
                muted
                loop
                playsInline
                poster={imageUrl || undefined}
                aria-hidden="true"
                data-reducemotion="pause"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : imageUrl ? (
              // aria-hidden: purely decorative background image div.
              <div
                className="hero-block__image-bg"
                aria-hidden="true"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition,
                }}
              />
            ) : null}

            {/* Image overlay — intentional inline style (compositing, not theming) */}
            {showGradient && (
              <div
                className="hero-block__overlay hero-block__overlay--gradient"
                aria-hidden="true"
              />
            )}
            {overlayRgba && (
              <div
                className="hero-block__overlay"
                aria-hidden="true"
                style={{ backgroundColor: overlayRgba }}
              />
            )}
          </>
        )}

        {/* Content */}
        <div className={innerClasses}>
          <HeroContent
            data={data}
            TitleTag={TitleTag}
            headingId={headingId}
            selfBlockId={selfBlockId}
            displayTitle={displayTitle}
            displaySubtitle={displaySubtitle}
            displayPreheader={displayPreheader}
            tocEntries={tocEntries}
            showBreadcrumbs={showBreadcrumbs}
            breadcrumbItems={breadcrumbItems}
            logoUrl={logoUrl}
            sideImageUrl={sideImageUrl}
            sideImageAlt={data.sideImageAlt}
            sideImageAlignment={data.sideImageAlignment || 'middle'}
            sideImageMobile={data.sideImageMobile || 'below'}
            isEditMode={isEditMode}
            hideTitle={hideTitle}
            otherPrimaryHeading={otherPrimaryHeading}
          />
        </div>
      </section>
    </BlockWrapper>
  );
};

export default View;
