/**
 * A number that counts up once when it first comes into view.
 *
 * The server (and visitors without JavaScript) get the real number, so the
 * page reads correctly before anything moves. Reduced motion, or
 * `duration` 0: no animation. Used by Content Row statistics and the Data
 * visualisation block's statistics cards.
 *
 * Props:
 *   end       the number
 *   duration  milliseconds (2000 by default)
 *   formatK   show thousands as "12k"
 *   className on the <span>
 */
import React from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from './format';

const decimalsOf = (value) => (String(value).split('.')[1] || '').length;

const CountUp = ({ end = 0, duration = 2000, formatK = false, className }) => {
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
    if (
      !el ||
      !duration ||
      reducedMotion ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined;
    }

    // Decimals (8.63) count up with the same number of decimals.
    const decimals = decimalsOf(safeEnd);
    const scale = 10 ** decimals;
    let raf;
    const animate = () => {
      let start = null;
      const step = (ts) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        let next = Math.floor(progress * safeEnd * scale) / scale;
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
    // A printout shows the final figure, never one caught halfway.
    const finish = () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      setValue(safeEnd);
    };
    window.addEventListener('beforeprint', finish);
    return () => {
      window.removeEventListener('beforeprint', finish);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [safeEnd, duration, formatK]);

  const text =
    formatK && safeEnd >= 1000
      ? `${formatNumber(Math.max(1, Math.floor(value / 1000)), locale)}k`
      : formatNumber(value, locale);
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
};

export default CountUp;
