/**
 * Server only: draws a chart as an SVG string, so it is in the page's
 * first HTML (no empty box, nothing moves, it prints, screen readers get a
 * description). Imported behind `__SERVER__`, so none of this reaches the
 * browser bundle.
 *
 * The full CommonJS build is used here: the server loads packages from
 * node_modules at run time, and ECharts' tree-shakable files are ES
 * modules only. Size doesn't matter on the server.
 */
// eslint-disable-next-line import/no-commonjs
const echarts = require('echarts');

const renderSvg = (option, { width, height }) => {
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  });
  try {
    chart.setOption(option);
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
};

export default renderSvg;
