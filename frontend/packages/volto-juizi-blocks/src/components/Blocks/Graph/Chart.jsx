/**
 * One ECharts chart.
 *
 * 1. On the server the chart is drawn as SVG into the page (renderSvg.js).
 * 2. In the browser the same markup is kept while the page hydrates: the
 *    SVG is read back from the page, so React sees identical HTML.
 * 3. When the chart comes into view (straight away in the editor), the
 *    ECharts browser build is loaded and an interactive chart (tooltips,
 *    legend) replaces the picture, at the real width and with the same
 *    aspect ratio, so nothing moves.
 *
 * Both draw SVG: vector output that prints sharp. Animations are off, so
 * a print or a screenshot never catches a chart halfway.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  buildChartOption,
  getChartSize,
  getLegendItems,
  withFont,
} from './chartOption';
import messages from './messages';

let renderSvg = null;
if (__SERVER__) {
  // eslint-disable-next-line global-require
  renderSvg = require('./renderSvg').default;
}

/** What the server drew for this chart, read back while hydrating. */
const svgFromPage = (domId) => {
  if (typeof document === 'undefined') return '';
  const svg = document
    .getElementById(domId)
    ?.querySelector('.graph-chart__svg');
  return svg ? svg.innerHTML : '';
};

/** The width charts are drawn at for printing: A4 or Letter in portrait,
 * less 15mm margins, in CSS pixels. */
const PRINT_WIDTH = 680;

const loadECharts = () =>
  import(/* webpackChunkName: "juizi-echarts" */ './echartsClient').then(
    (module) => module.default,
  );

const Chart = ({
  view,
  table,
  data,
  palette,
  language,
  label,
  domId,
  eager,
}) => {
  const size = getChartSize(view, data, table.rows.length);
  // Options hold formatter functions: rebuild them only when what they
  // draw changes.
  const key = JSON.stringify([
    view,
    table.columns,
    table.rows,
    data,
    palette,
    language,
  ]);
  const option = useMemo(
    () => buildChartOption({ view, table, data, palette, language }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const [svg] = useState(() => {
    if (renderSvg) {
      try {
        return renderSvg(option, size);
      } catch (error) {
        return '';
      }
    }
    return svgFromPage(domId);
  });

  const intl = useIntl();
  const legend = useMemo(
    () => getLegendItems({ view, table, palette }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const [hidden, setHidden] = useState([]);
  const holder = useRef(null);
  const printCopy = useRef(null);
  const chart = useRef(null);
  const optionRef = useRef(option);
  optionRef.current = option;
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const font = useRef('');
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer;
    let resize;
    // Measure text only once the page's web fonts have loaded.
    const fontsReady = () =>
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();
    // Printing: a copy drawn at the paper's width, the way the server draws
    // (with a viewBox, so it scales to the page), in the page's font. The
    // printout shows it instead of the screen-wide interactive chart.
    let lib;
    const drawForPrint = () => {
      const target = printCopy.current;
      if (!lib || !target) return;
      const width = Math.min(size.width, PRINT_WIDTH);
      const height = Math.round((width * size.height) / size.width);
      const copy = lib.init(null, null, {
        renderer: 'svg',
        ssr: true,
        width,
        height,
      });
      try {
        const hiddenNow = Object.fromEntries(
          hiddenRef.current.map((name) => [name, false]),
        );
        const current = withFont(optionRef.current, font.current);
        // Keys switched off on screen stay off on paper. Only charts that
        // have the (hidden) legend get one: a new legend would be drawn.
        copy.setOption(
          current.legend
            ? { ...current, legend: { ...current.legend, selected: hiddenNow } }
            : current,
          true,
        );
        target.innerHTML = copy.renderToSVGString();
      } catch (error) {
        target.innerHTML = '';
      } finally {
        copy.dispose();
      }
    };
    const printQuery =
      typeof window !== 'undefined' ? window.matchMedia?.('print') : null;
    const onPrintQuery = (event) => event.matches && drawForPrint();
    const start = () =>
      Promise.all([loadECharts(), fontsReady()])
        .then(([echarts]) => {
          if (cancelled || !holder.current) return;
          lib = echarts;
          font.current = window.getComputedStyle(holder.current).fontFamily;
          chart.current = echarts.init(holder.current, null, {
            renderer: 'svg',
          });
          chart.current.setOption(withFont(option, font.current), true);
          setLive(true);
          if (typeof ResizeObserver !== 'undefined') {
            resize = new ResizeObserver(() => chart.current?.resize());
            resize.observe(holder.current);
          }
          window.addEventListener('beforeprint', drawForPrint);
          printQuery?.addEventListener?.('change', onPrintQuery);
        })
        .catch(() => {
          // Offline or blocked: the drawn picture stays.
        });
    if (eager || typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            start();
          }
        },
        { rootMargin: '300px' },
      );
      observer.observe(holder.current);
    }
    return () => {
      window.removeEventListener('beforeprint', drawForPrint);
      printQuery?.removeEventListener?.('change', onPrintQuery);
      cancelled = true;
      observer?.disconnect();
      resize?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
    // Started once; option changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chart.current?.setOption(withFont(option, font.current), true);
    setHidden([]);
  }, [option]);

  const toggle = (name) => {
    chart.current?.dispatchAction({ type: 'legendToggleSelect', name });
    setHidden((names) =>
      names.includes(name) ? names.filter((n) => n !== name) : [...names, name],
    );
  };

  const picture = (
    <div
      className="graph-chart"
      id={domId}
      role="img"
      aria-label={label}
      style={{ aspectRatio: `${size.width} / ${size.height}` }}
    >
      {!live && (
        <div
          className="graph-chart__svg"
          // ECharts' own SVG output, drawn from the block's data on the server.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      <div className="graph-chart__live" ref={holder} />
      {live && (
        <div
          className="graph-chart__print"
          ref={printCopy}
          aria-hidden="true"
        />
      )}
    </div>
  );
  if (!legend.length) return picture;
  return (
    <>
      {picture}
      {/* Keys as page content, so they wrap on narrow screens. Each one
          hides or shows its part of the chart once the chart is live. */}
      <ul
        className="graph-legend"
        aria-label={intl.formatMessage(messages.legend)}
      >
        {legend.map(({ name, color }) => (
          <li key={name} className="graph-legend__item">
            <button
              type="button"
              className="graph-legend__button"
              aria-pressed={!hidden.includes(name)}
              disabled={!live}
              onClick={() => toggle(name)}
            >
              <span
                className="graph-legend__swatch"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {name}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Chart;
