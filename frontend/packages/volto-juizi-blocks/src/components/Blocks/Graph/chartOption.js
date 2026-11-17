/**
 * ECharts options for the chart views. Pure: the server draws the SVG from
 * the same options the browser uses once the chart becomes interactive, so
 * the two look the same.
 *
 * Settings read from the block (names kept from the older GraphBlock):
 *   showDataLabels, dataLabelPosition ('end' | 'center' | 'start'),
 *   xLabel, yLabel, reverseX, reverseY, xPercent, yPercent, useNarrow.
 * Percentages are also recognised from the data ("8.63%").
 */
import { toLocale } from '../_shared/format';
import { getLabels, getSeries } from './data';
import { pickColors } from './palette';
import { HORIZONTAL_VIEWS, PIE_VIEWS } from './views';

export const TEXT = '#333333';

/** The keys are drawn under the chart as page content (`.graph-legend`), so
 * they wrap on phones. ECharts keeps a hidden legend, which lets those keys
 * hide and show series (`legendToggleSelect`). */
const LEGEND = { show: false };
const AXIS = '#8c8c8c';
const GRID = '#e6e6e6';

/** Drawing size before the browser knows the real width. The page keeps
 * this aspect ratio, so nothing moves when the chart becomes interactive. */
export const getChartSize = (view, data = {}, rowCount = 0) => {
  const width = data.useNarrow ? 560 : 800;
  if (PIE_VIEWS.includes(view)) return { width, height: 380 };
  if (HORIZONTAL_VIEWS.includes(view)) {
    // One row per category: taller for more rows, within reason.
    const height = Math.min(Math.max(80 + rowCount * 26, 300), 1400);
    return { width, height };
  }
  return { width, height: data.useNarrow ? 400 : 450 };
};

export const numberFormatter = (language) => {
  const format = new Intl.NumberFormat(toLocale(language), {
    maximumFractionDigits: 2,
  });
  return (value, percent) =>
    value === null || value === undefined || Number.isNaN(value)
      ? ''
      : `${format.format(value)}${percent ? '%' : ''}`;
};

const labelPosition = (position, horizontal) => {
  if (position === 'center') return 'inside';
  if (position === 'start') return horizontal ? 'insideLeft' : 'insideBottom';
  return horizontal ? 'right' : 'top';
};

/**
 * @param view     'bar', 'line', … (views.js)
 * @param table    { columns, rows }
 * @param data     the block's data
 * @param palette  ordered hex colours (palette.js)
 * @param language the page's language, for number formatting
 */
/**
 * The option with the page's own font named, for charts drawn in the
 * browser. ECharts places legend keys and labels by measuring their text,
 * and can't measure `inherit` (it falls back to another font, so gaps
 * depend on label length); the server's picture keeps `inherit`.
 */
export const withFont = (option, fontFamily) =>
  fontFamily
    ? { ...option, textStyle: { ...option.textStyle, fontFamily } }
    : option;

/**
 * The keys shown under a chart, in the chart's colours: a pie's slices, or
 * the series when there's more than one. Empty when no key is needed.
 */
export const getLegendItems = ({ view, table, palette }) => {
  const labels = getLabels(table);
  const series = getSeries(table).filter((s) => s.numeric);
  if (PIE_VIEWS.includes(view)) {
    if (!series.length) return [];
    const colors = pickColors(palette, labels.length);
    return labels.map((name, i) => ({ name, color: colors[i] }));
  }
  if (series.length < 2) return [];
  const colors = pickColors(palette, series.length);
  return series.map((s, i) => ({ name: s.name, color: colors[i] }));
};

export const buildChartOption = ({
  view,
  table,
  data = {},
  palette,
  language,
}) => {
  const format = numberFormatter(language);
  const labels = getLabels(table);
  const series = getSeries(table).filter((s) => s.numeric);
  const horizontal = HORIZONTAL_VIEWS.includes(view);
  const percentSetting = horizontal ? data.xPercent : data.yPercent;
  const isPercent = (s) => !!percentSetting || s.percent;
  const base = {
    animation: false,
    textStyle: { fontFamily: 'inherit', color: TEXT },
    aria: { enabled: true, decal: { show: false } },
  };

  if (PIE_VIEWS.includes(view)) {
    const first = series[0];
    const colors = pickColors(palette, labels.length);
    return {
      ...base,
      color: colors,
      tooltip: {
        trigger: 'item',
        confine: true,
        valueFormatter: (v) => format(v, first && isPercent(first)),
      },
      legend: LEGEND,
      series: first
        ? [
            {
              type: 'pie',
              name: first.name,
              radius: view === 'doughnut' ? ['42%', '68%'] : '68%',
              center: ['50%', '50%'],
              avoidLabelOverlap: true,
              label: { color: TEXT, formatter: '{b}: {d}%' },
              data: labels.map((name, i) => ({
                name,
                value: first.values[i] ?? 0,
              })),
            },
          ]
        : [],
    };
  }

  const colors = pickColors(palette, Math.max(series.length, 1));
  const showLegend = series.length > 1;
  // Bars and line: the line (the last column, often a rate) gets its own
  // axis on the right, so it isn't flattened against the bars' scale.
  const twoAxes = view === 'mixed' && series.length > 1;
  const lineSeries = twoAxes ? series[series.length - 1] : null;
  const barSeries = twoAxes ? series.slice(0, -1) : series;
  const valueAxis = {
    type: 'value',
    inverse: horizontal ? !!data.reverseX : !!data.reverseY,
    name: (horizontal ? data.xLabel : data.yLabel) || '',
    nameLocation: 'middle',
    nameGap: horizontal ? 32 : 56,
    nameTextStyle: { color: TEXT },
    axisLabel: {
      color: TEXT,
      formatter: (v) =>
        format(view === 'pyramid' ? Math.abs(v) : v, barSeries.some(isPercent)),
    },
    splitLine: { lineStyle: { color: GRID } },
  };
  const lineAxis = lineSeries && {
    type: 'value',
    position: 'right',
    name: lineSeries.name,
    nameLocation: 'middle',
    nameGap: 48,
    nameTextStyle: { color: TEXT },
    axisLabel: {
      color: TEXT,
      formatter: (v) => format(v, isPercent(lineSeries)),
    },
    splitLine: { show: false },
  };
  const categoryAxis = {
    type: 'category',
    data: labels,
    // Horizontal charts list the first row at the top, like a table.
    inverse: horizontal ? !data.reverseY : !!data.reverseX,
    name: (horizontal ? data.yLabel : data.xLabel) || '',
    nameLocation: 'middle',
    nameGap: horizontal ? 80 : 32,
    nameTextStyle: { color: TEXT },
    axisLabel: { color: TEXT, hideOverlap: true },
    axisLine: { lineStyle: { color: AXIS } },
    axisTick: { alignWithLabel: true },
  };
  const many = labels.length > 40;

  const built = series.map((s, i) => {
    const percent = isPercent(s);
    const isLine =
      view === 'line' ||
      view === 'area' ||
      (view === 'mixed' && i === series.length - 1 && series.length > 1);
    const values =
      view === 'pyramid' && i === 0
        ? s.values.map((v) => (v === null ? null : -Math.abs(v)))
        : view === 'pyramid'
          ? s.values.map((v) => (v === null ? null : Math.abs(v)))
          : s.values;
    const item = {
      name: s.name,
      type: isLine ? 'line' : 'bar',
      ...(lineSeries && s === lineSeries ? { yAxisIndex: 1 } : {}),
      data: values,
      itemStyle: { color: colors[i] },
      tooltip: {
        valueFormatter: (v) =>
          format(view === 'pyramid' ? Math.abs(v) : v, percent),
      },
    };
    if (isLine) {
      Object.assign(item, {
        showSymbol: !many,
        symbolSize: 6,
        connectNulls: true,
        lineStyle: { width: 2.5, color: colors[i] },
        z: 3,
        ...(view === 'area' ? { areaStyle: { opacity: 0.2 } } : {}),
      });
    } else {
      Object.assign(item, {
        barMaxWidth: 48,
        ...(view === 'pyramid' ? { stack: 'pyramid' } : {}),
        ...(labels.length > 400 ? { large: true } : {}),
      });
    }
    if (data.showDataLabels && !(isLine && view === 'mixed')) {
      item.label = {
        show: true,
        color: data.dataLabelPosition === 'center' ? '#ffffff' : TEXT,
        position: isLine
          ? 'top'
          : labelPosition(data.dataLabelPosition, horizontal),
        formatter: ({ value }) =>
          format(view === 'pyramid' ? Math.abs(value) : value, percent),
      };
    }
    return item;
  });

  return {
    ...base,
    color: colors,
    grid: {
      left: 12,
      right: 24,
      top: 24,
      bottom: 12,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: {
        type: view === 'line' || view === 'area' ? 'line' : 'shadow',
      },
    },
    legend: showLegend ? LEGEND : undefined,
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal
      ? categoryAxis
      : lineAxis
        ? [valueAxis, lineAxis]
        : valueAxis,
    series: built,
  };
};
