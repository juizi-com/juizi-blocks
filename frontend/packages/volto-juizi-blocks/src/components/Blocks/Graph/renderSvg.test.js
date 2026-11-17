import renderSvg from './renderSvg';
import { buildChartOption } from './chartOption';

// Volto's server has no DOM and ECharts estimates text widths there. The
// test environment has a DOM without canvas, so give it a measuring stub.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => ({
    measureText: (text) => ({ width: String(text).length * 7 }),
  });
});

describe('server drawing', () => {
  it('draws the chart as an SVG string', () => {
    const option = buildChartOption({
      view: 'line',
      table: {
        columns: ['Date', 'Price'],
        rows: [
          ['30/01/1996', '186.3'],
          ['31/01/1996', '186.7'],
        ],
      },
      palette: ['#0d7fa1'],
      language: 'en',
    });
    const svg = renderSvg(option, { width: 800, height: 450 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 800 450"');
    expect(svg).toContain('#0d7fa1');
    expect(svg).toContain('30/01/1996');
  });
});
