/**
 * Mobile carousel shared by blocks that show a row of items (Content Row,
 * Pricing tiers). The block renders its normal grid as well; its CSS shows
 * one or the other per screen size, so on desktop this stays hidden.
 *
 * Classes are prefixed with the block's own class, so each block styles its
 * carousel in its own stylesheet:
 *   {blockClass}__embla, __embla-viewport, __embla-container, __embla-slide,
 *   __embla-dots, __embla-dot (.is-selected)
 *
 * Props:
 *   blockClass  the block's BEM class, e.g. 'content-row' (required)
 *   label       accessible name for the carousel region (required)
 *   autoplay    move on every 4 seconds (never with reduced motion)
 *   showDots    dots under the slides to jump to one
 *   startIndex  the slide shown first (0 by default)
 *   arrows      previous / next buttons: 'above', 'middle' (one on each
 *               side of the slide, which narrows to make room, so they
 *               never cover it) or 'below'; none when empty
 *   arrowStyle  a button style value ('solid__teal'…); empty: outlined in
 *               the text colour
 *
 * With arrows, the root also gets `mobile-carousel` and
 * `mobile-carousel--arrows-{position}`, and the buttons
 * `mobile-carousel__arrow` (mobile-carousel.css). Without arrows the markup
 * is exactly as before.
 */
import React from 'react';
import { useIntl } from 'react-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getButtonClasses } from '../../../config/colors';
import NavArrowIcon from './NavArrowIcon';
import shared from './messages';
import './mobile-carousel.css';

const ARROW_POSITIONS = ['above', 'middle', 'below'];

const MobileCarousel = ({
  blockClass,
  label,
  children,
  autoplay,
  showDots,
  startIndex = 0,
  arrows,
  arrowStyle,
}) => {
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
    { align: 'center', loop: true, startIndex },
    plugins,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(startIndex);
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

  const arrowPosition =
    ARROW_POSITIONS.includes(arrows) && slideCount > 1 ? arrows : null;
  const arrowButton = (direction) => {
    const { className, style } = getButtonClasses(
      arrowStyle || '',
      'mobile-carousel__arrow',
    );
    const previous = direction === 'left';
    return (
      <button
        type="button"
        className={`${className} mobile-carousel__arrow--${
          previous ? 'prev' : 'next'
        }`}
        style={style}
        aria-label={intl.formatMessage(
          previous ? shared.previousSlide : shared.nextSlide,
        )}
        onClick={() =>
          previous ? emblaApi?.scrollPrev() : emblaApi?.scrollNext()
        }
      >
        <NavArrowIcon
          direction={direction}
          className="mobile-carousel__arrow-icon"
        />
      </button>
    );
  };
  const arrowRow = (
    <div className="mobile-carousel__arrows">
      {arrowButton('left')}
      {arrowButton('right')}
    </div>
  );

  const viewport = (
    <div className={`${blockClass}__embla-viewport`} ref={emblaRef}>
      <div className={`${blockClass}__embla-container`}>
        {React.Children.map(children, (child, i) => (
          <div key={i} className={`${blockClass}__embla-slide`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={
        arrowPosition
          ? `${blockClass}__embla mobile-carousel mobile-carousel--arrows-${arrowPosition}`
          : `${blockClass}__embla`
      }
      role="region"
      aria-label={label}
    >
      {arrowPosition === 'above' && arrowRow}
      {arrowPosition === 'middle' ? (
        <div className="mobile-carousel__stage">
          {arrowButton('left')}
          {viewport}
          {arrowButton('right')}
        </div>
      ) : (
        viewport
      )}
      {arrowPosition === 'below' && arrowRow}
      {showDots && slideCount > 1 && (
        <div className={`${blockClass}__embla-dots`}>
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              className={`${blockClass}__embla-dot${i === selectedIndex ? ' is-selected' : ''}`}
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

export default MobileCarousel;
