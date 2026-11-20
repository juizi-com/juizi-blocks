/**
 * Stop / start button for carousels that move on their own.
 *
 * WCAG 2.2.2 (Pause, Stop, Hide): anything that moves by itself for more
 * than five seconds needs a way to stop it. Hovering or focusing a slide
 * already holds it, but that doesn't help someone who is reading beside it,
 * using a screen magnifier, or easily distracted by movement, so the
 * carousel shows this button whenever autoplay is on. Once the visitor stops
 * the slides they stay stopped (the autoplay plugin would otherwise restart
 * them when the pointer or focus leaves), until the visitor starts them
 * again.
 *
 *   const autoplay = useAutoplayToggle(emblaApi);
 *   <AutoplayToggle {...autoplay} className="embla__autoplay" />
 *
 * Renders nothing when the carousel has no autoplay (it's off, or reduced
 * motion is on).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Pause, Play } from 'lucide-react';
import shared from './messages';
import './autoplay-toggle.css';

export const useAutoplayToggle = (emblaApi) => {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stoppedByVisitor = useRef(false);

  useEffect(() => {
    const autoplay = emblaApi?.plugins?.()?.autoplay;
    if (!autoplay) {
      setAvailable(false);
      return undefined;
    }
    setAvailable(true);
    setPlaying(autoplay.isPlaying());
    // The plugin announces play / stop before isPlaying() changes, so go by
    // the event, and stop a restart the visitor didn't ask for once the
    // plugin has finished starting.
    let timer;
    const onPlay = () => {
      if (stoppedByVisitor.current) {
        timer = setTimeout(() => autoplay.stop());
        return;
      }
      setPlaying(true);
    };
    const onStop = () => setPlaying(false);
    emblaApi.on('autoplay:play', onPlay).on('autoplay:stop', onStop);
    return () => {
      clearTimeout(timer);
      emblaApi.off('autoplay:play', onPlay).off('autoplay:stop', onStop);
    };
  }, [emblaApi]);

  const toggle = useCallback(() => {
    const autoplay = emblaApi?.plugins?.()?.autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) {
      stoppedByVisitor.current = true;
      autoplay.stop();
    } else {
      stoppedByVisitor.current = false;
      autoplay.play();
    }
  }, [emblaApi]);

  return { available, playing, toggle };
};

const AutoplayToggle = ({ available, playing, toggle, className }) => {
  const intl = useIntl();
  if (!available) return null;
  const Icon = playing ? Pause : Play;
  return (
    <button
      type="button"
      className={['juizi-autoplay-toggle', className].filter(Boolean).join(' ')}
      onClick={toggle}
      aria-label={intl.formatMessage(
        playing ? shared.pauseSlides : shared.playSlides,
      )}
    >
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
};

export default AutoplayToggle;
