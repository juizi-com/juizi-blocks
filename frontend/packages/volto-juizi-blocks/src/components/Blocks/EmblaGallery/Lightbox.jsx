import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useIntl } from 'react-intl';
import shared from '../_shared/messages';
import messages from './messages';

// aria-hidden — the button's own aria-label carries the accessible name,
// matching the convention EmblaCarousel uses for its nav arrows.
const CloseIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 3l10 10M13 3L3 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronIcon = ({ direction }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Rendered once per gallery block via a portal to document.body, so it
 * always sits above whatever stacking context the block itself is in.
 * `activeIndex === null` means closed — nothing is rendered.
 */
const Lightbox = ({
  items,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  showCaption,
  arrowStyleParsed,
}) => {
  const intl = useIntl();
  const closeRef = useRef(null);
  const touchStartX = useRef(null);
  const previouslyFocused = useRef(null);

  // Keyboard nav, focus trap entry, and background scroll lock while open
  useEffect(() => {
    if (activeIndex === null) return undefined;

    previouslyFocused.current =
      typeof document !== 'undefined' ? document.activeElement : null;
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Return focus to whatever triggered the lightbox
      if (
        previouslyFocused.current &&
        typeof previouslyFocused.current.focus === 'function'
      ) {
        previouslyFocused.current.focus();
      }
    };
  }, [activeIndex, onClose, onPrev, onNext]);

  if (activeIndex === null || typeof document === 'undefined') return null;

  const item = items[activeIndex];
  if (!item) return null;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) onPrev();
      else onNext();
    }
    touchStartX.current = null;
  };

  return ReactDOM.createPortal(
    <div
      className="gallery__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.heading || intl.formatMessage(shared.image)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeRef}
        type="button"
        className={`gallery__lightbox-close ${arrowStyleParsed.className}`}
        style={arrowStyleParsed.style}
        aria-label={intl.formatMessage(shared.close)}
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      {items.length > 1 && (
        <button
          type="button"
          className={`gallery__lightbox-prev ${arrowStyleParsed.className}`}
          style={arrowStyleParsed.style}
          aria-label={intl.formatMessage(shared.previousImage)}
          onClick={onPrev}
        >
          <ChevronIcon direction="left" />
        </button>
      )}

      <div className="gallery__lightbox-body">
        <img
          className="gallery__lightbox-image"
          src={item.imageUrl}
          alt={item.heading || ''}
        />
        {showCaption && item.heading && (
          <p className="gallery__lightbox-caption">{item.heading}</p>
        )}
        {items.length > 1 && (
          <p className="gallery__lightbox-counter">
            {intl.formatMessage(messages.counter, {
              current: activeIndex + 1,
              total: items.length,
            })}
          </p>
        )}
      </div>

      {items.length > 1 && (
        <button
          type="button"
          className={`gallery__lightbox-next ${arrowStyleParsed.className}`}
          style={arrowStyleParsed.style}
          aria-label={intl.formatMessage(shared.nextImage)}
          onClick={onNext}
        >
          <ChevronIcon direction="right" />
        </button>
      )}
    </div>,
    document.body,
  );
};

export default Lightbox;
