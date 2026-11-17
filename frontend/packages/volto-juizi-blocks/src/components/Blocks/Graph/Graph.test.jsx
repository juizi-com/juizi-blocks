import './testGlobals';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import graph from './index';
import View from './View';
import { graphSchema, isConfigured } from './schema';
import {
  getDataSource,
  getFigureNumber,
  getSeries,
  getTable,
  toNumber,
} from './data';
import { getChartPalette, luminance, pickColors } from './palette';
import {
  getLegendItems,
  withFont,
  buildChartOption,
  getChartSize,
} from './chartOption';
import { getCardLook, getRankedGroups, getStats } from './Cards';
import ChartTypeWidget from './widgets/ChartTypeWidget';
import messages from './messages';

jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('../_shared/BlockWrapper');
jest.mock('../../../settings', () => ({
  useJuiziBlocksSettings: () => ({
    color_config: {
      colors: [
        { name: 'white', label: 'White', value: '#ffffff', dark: false },
        { name: 'blue', label: 'Blue', value: '#0d7fa1', dark: true },
      ],
      blocks: {},
    },
  }),
}));
jest.mock(
  '@plone/volto/components/manage/Widgets/FormFieldWrapper',
  () =>
    ({ children }) =>
      children,
);

// CRA's live report (city-of-johannesburg-tariff-increases…), as saved by
// the older GraphBlock, with the data the backend adds.
const increases = {
  columns: ['Service', 'Approved average increase'],
  rows: [
    ['Electricity', '8.63%'],
    ['Water', '12.50%'],
    ['Sanitation', '11.00%'],
  ],
  total: 3,
  error: null,
  fileIsPublic: true,
  source: { file: '../../../resolveuid/c31a', delimiter: ';', kind: 'rows' },
};
const craTable = {
  '@type': 'graphBlock',
  statAnimationMs: 1500,
  delimiter: ';',
  chartType: 'table',
  csvFile: [{ '@id': '../../../resolveuid/c31a', '@type': 'File' }],
  dataTable: increases,
};

const renderView = (props) =>
  render(
    <IntlProvider locale="en">
      <View block="g1" {...props} />
    </IntlProvider>,
  );

describe('Data visualisation block', () => {
  it('keeps the older GraphBlock’s id', () => {
    expect(graph.id).toBe('graphBlock');
    expect(Object.keys(graph.widgets)).toEqual([
      'juiziChartType',
      'juiziPasteTable',
    ]);
  });

  describe('reading data', () => {
    it('reads numbers as the older block did, plus spaces', () => {
      expect(toNumber('1,234.5')).toBe(1234.5);
      expect(toNumber(' 8.63% ')).toBe(8.63);
      expect(toNumber('1 000')).toBe(1000);
      expect(toNumber('Water')).toBeNull();
      expect(toNumber('')).toBeNull();
    });

    it('treats older blocks with a file as file blocks', () => {
      expect(getDataSource(craTable)).toBe('file');
      expect(getDataSource({})).toBeUndefined();
      expect(getDataSource({ dataSource: 'paste' })).toBe('paste');
    });

    it('finds number and percentage columns', () => {
      const [series] = getSeries(increases);
      expect(series.numeric).toBe(true);
      expect(series.percent).toBe(true);
      expect(series.values).toEqual([8.63, 12.5, 11]);
      const text = getSeries({
        columns: ['Mineral', 'Uses'],
        rows: [['Cobalt', 'Batteries']],
      });
      expect(text[0].numeric).toBe(false);
    });

    it('uses pasted data from the block and file data from the page', () => {
      expect(getTable(craTable).rows).toHaveLength(3);
      const pasted = getTable({
        dataSource: 'paste',
        pastedTable: { columns: ['a', 'b'], rows: [['x', '1']] },
        dataTable: increases,
      });
      expect(pasted.columns).toEqual(['a', 'b']);
      // The editor's live preview wins over the page's copy.
      expect(getTable(craTable, { columns: ['z'], rows: [] }).columns).toEqual([
        'z',
      ]);
    });

    it('numbers figures in page order, skipping left-out ones', () => {
      const properties = {
        blocks_layout: { items: ['a', 't', 'b', 'c'] },
        blocks: {
          a: { '@type': 'graphBlock' },
          t: { '@type': 'slate' },
          b: { '@type': 'graphBlock', independent: true },
          c: { '@type': 'graphBlock' },
        },
      };
      expect(getFigureNumber(properties, 'a')).toBe(1);
      expect(getFigureNumber(properties, 'b')).toBeNull();
      expect(getFigureNumber(properties, 'c')).toBe(2);
      expect(getFigureNumber(undefined, 'c')).toBeNull();
    });
  });

  describe('colours', () => {
    const colors = [
      { name: 'white', value: '#ffffff' },
      { name: 'faded', value: '#e3f1e4' },
      { name: 'green', value: '#2e7d32' },
      { name: 'blue', value: '#123e6b' },
    ];

    it('uses the dashboard’s chart colours in order', () => {
      expect(
        getChartPalette({
          colors,
          blocks: { graphBlock: { chartColors: ['blue', 'gone', 'green'] } },
        }),
      ).toEqual(['#123e6b', '#2e7d32']);
    });

    it('falls back to the site colours without the light ones', () => {
      expect(getChartPalette({ colors, blocks: {} })).toEqual([
        '#2e7d32',
        '#123e6b',
      ]);
      expect(luminance('#ffffff')).toBeCloseTo(1);
    });

    it('repeats the palette in lighter shades when it runs out', () => {
      const picked = pickColors(['#000000'], 3);
      expect(picked[0]).toBe('#000000');
      expect(picked[1]).not.toBe('#000000');
      expect(new Set(picked).size).toBe(3);
    });
  });

  describe('chart options', () => {
    it('names the page’s font for the browser, keeps inherit otherwise', () => {
      const option = buildChartOption({ view: 'pie', table: age, palette });
      expect(option.textStyle.fontFamily).toBe('inherit');
      expect(withFont(option, 'Karla').textStyle.fontFamily).toBe('Karla');
      expect(withFont(option, '')).toBe(option);
      // The keys are page content under the chart (they wrap on phones);
      // ECharts keeps a hidden legend so they can hide and show series.
      expect(option.legend.show).toBe(false);
      expect(
        getLegendItems({ view: 'pie', table: age, palette }).map((i) => i.name),
      ).toEqual(age.rows.map((row) => row[0]));
      expect(
        getLegendItems({
          view: 'bar',
          table: { columns: ['Year', 'Price'], rows: [['2020', '1']] },
          palette,
        }),
      ).toEqual([]);
    });

    const palette = ['#0d7fa1', '#064c3f'];
    const age = {
      columns: ['Age', 'Men', 'Women'],
      rows: [
        ['0-4', '10', '9'],
        ['5-9', '8', '8'],
      ],
    };

    it('draws one series per number column, without animation', () => {
      const option = buildChartOption({ view: 'bar', table: age, palette });
      expect(option.animation).toBe(false);
      expect(option.series.map((s) => s.type)).toEqual(['bar', 'bar']);
      expect(option.xAxis.data).toEqual(['0-4', '5-9']);
      expect(option.legend).toBeDefined();
    });

    it('draws the last column as a line in bars and line', () => {
      const option = buildChartOption({ view: 'mixed', table: age, palette });
      expect(option.series.map((s) => s.type)).toEqual(['bar', 'line']);
      // On its own axis on the right, labelled in its own units.
      expect(option.series[1].yAxisIndex).toBe(1);
      expect(option.yAxis[1].position).toBe('right');
      const rates = buildChartOption({
        view: 'mixed',
        table: {
          columns: ['Year', 'Exports', 'Growth'],
          rows: [['2023', '120', '3.1%']],
        },
        palette,
      });
      expect(rates.yAxis[0].axisLabel.formatter(120)).toBe('120');
      expect(rates.yAxis[1].axisLabel.formatter(3)).toBe('3%');
    });

    it('puts the first column on the left of a pyramid', () => {
      const option = buildChartOption({ view: 'pyramid', table: age, palette });
      expect(option.series[0].data).toEqual([-10, -8]);
      expect(option.series[1].data).toEqual([9, 8]);
      expect(option.yAxis.type).toBe('category');
      expect(option.xAxis.axisLabel.formatter(-10)).toBe('10');
    });

    it('makes pie slices from the rows', () => {
      const option = buildChartOption({
        view: 'doughnut',
        table: increases,
        palette,
      });
      expect(option.series[0].data[0]).toEqual({
        name: 'Electricity',
        value: 8.63,
      });
      expect(option.series[0].radius).toEqual(['42%', '68%']);
    });

    it('shows percentages from the data or the setting', () => {
      const fromData = buildChartOption({
        view: 'bar',
        table: increases,
        palette,
      });
      expect(fromData.yAxis.axisLabel.formatter(12.5)).toBe('12.5%');
      const fromSetting = buildChartOption({
        view: 'bar',
        table: age,
        data: { yPercent: true },
        palette,
      });
      expect(fromSetting.yAxis.axisLabel.formatter(10)).toBe('10%');
    });

    it('makes horizontal charts taller with more rows', () => {
      expect(getChartSize('barHorizontal', {}, 40).height).toBeGreaterThan(
        getChartSize('barHorizontal', {}, 5).height,
      );
      expect(getChartSize('bar', { useNarrow: true }).width).toBe(560);
    });
  });

  describe('cards', () => {
    it('compares the extra columns with the main figure', () => {
      const [card] = getStats({
        columns: ['Province', '2025', '2024', '2023'],
        rows: [['Gauteng', '10', '8', '10']],
      });
      expect(card.subs.map((s) => s.direction)).toEqual(['down', 'same']);
    });

    it('groups ranked rows, with an optional Subtitle column', () => {
      const groups = getRankedGroups(
        {
          columns: ['Group', 'Subtitle', 'Label', 'Value'],
          rows: [
            ['A', 'first', 'x', '10'],
            ['A', 'first', 'y', '5'],
            ['B', 'second', 'z', '2'],
          ],
        },
        { needsGroup: true },
      );
      expect(groups.map((g) => g.title)).toEqual(['A', 'B']);
      expect(groups[0].subtitle).toBe('first');
      expect(groups[0].rows[1].pct).toBe(50);
    });

    it('reads the older block’s card colour', () => {
      const look = getCardLook({
        cardBackgroundColor: 'var(--blue-base)|dark',
      });
      expect(look.style.backgroundColor).toBe('var(--blue-base)');
      expect(look.className).toContain('bg-dark');
      expect(
        getCardLook({ cardBackgroundColor: 'none' }).style,
      ).toBeUndefined();
    });
  });

  describe('on the page', () => {
    it('shows nothing to visitors until there is data', () => {
      const { container } = renderView({ data: { '@type': 'graphBlock' } });
      expect(container.innerHTML).toBe('');
    });

    it('starts editors with the two ways to add data', () => {
      const { container } = renderView({
        data: { '@type': 'graphBlock' },
        isEditMode: true,
      });
      expect(container.querySelector('.block-placeholder')).not.toBeNull();
      expect(screen.getByText(messages.sourceFile.defaultMessage)).toBeTruthy();
      expect(container.querySelector('button, input')).toBeNull();
    });

    it('asks how to show the data once it is there', () => {
      renderView({
        data: { ...craTable, chartType: undefined },
        isEditMode: true,
      });
      expect(
        screen.getByText(messages.chooseViewPrompt.defaultMessage),
      ).toBeTruthy();
    });

    it('lists a pie’s keys under the chart, one per slice', () => {
      const { container } = renderView({
        data: { ...craTable, chartType: 'pie' },
      });
      const keys = [...container.querySelectorAll('.graph-legend button')];
      expect(keys.map((k) => k.textContent)).toEqual(
        craTable.dataTable.rows.map((row) => row[0]),
      );
      expect(keys[0].getAttribute('aria-pressed')).toBe('true');
      expect(container.querySelector('.graph-chart .graph-legend')).toBeNull();
    });

    it('adds the padding chosen, and none when left empty', () => {
      const { container } = renderView({
        data: { ...craTable, paddingTop: 'spacious', paddingBottom: 'none' },
      });
      const figure = container.querySelector('.graph-block');
      expect(figure.className).toContain('graph-block--pad-top-spacious');
      expect(figure.className).toContain('graph-block--pad-bottom-none');
      const plain = renderView({ data: craTable }).container;
      expect(plain.querySelector('.graph-block').className).not.toMatch(/pad-/);
    });

    it('renders CRA’s saved table block unchanged', () => {
      const { container } = renderView({ data: craTable });
      const cells = [...container.querySelectorAll('tbody td')].map(
        (td) => td.textContent,
      );
      expect(cells.slice(0, 2)).toEqual(['Electricity', '8.63%']);
      expect(container.querySelectorAll('th')).toHaveLength(2);
    });

    it('says when a long table was cut short', () => {
      renderView({
        data: {
          ...craTable,
          dataTable: { ...increases, total: 7612, truncated: true },
        },
      });
      expect(
        screen.getByText('Showing the first 3 of 7,612 rows.'),
      ).toBeTruthy();
    });

    it('warns editors about a private file, never visitors', () => {
      const data = {
        ...craTable,
        dataTable: { ...increases, fileIsPublic: false },
      };
      renderView({ data, isEditMode: true });
      expect(
        screen.getByText(messages.filePrivate.defaultMessage),
      ).toBeTruthy();
    });

    it('hides a private file’s block from visitors', () => {
      const { container } = renderView({
        data: {
          ...craTable,
          dataTable: { columns: [], rows: [], error: 'private' },
        },
      });
      expect(container.innerHTML).toBe('');
    });

    it('numbers the caption', () => {
      const data = { ...craTable, description: 'Source: City of Joburg' };
      renderView({
        data,
        properties: {
          blocks_layout: { items: ['g1'] },
          blocks: { g1: data },
        },
      });
      expect(screen.getByText('Figure 1:')).toBeTruthy();
    });

    it('draws a chart with a description for screen readers', () => {
      const { container } = renderView({
        data: { ...craTable, chartType: 'bar', title: 'Tariffs' },
      });
      const chart = container.querySelector('.graph-chart');
      expect(chart.getAttribute('role')).toBe('img');
      expect(chart.getAttribute('aria-label')).toContain('Tariffs');
      expect(chart.style.aspectRatio).toBe('800 / 450');
      // The figures are also offered as a table.
      expect(container.querySelector('details table')).not.toBeNull();
    });

    it('explains when the data doesn’t suit the view', () => {
      renderView({
        data: { ...craTable, chartType: 'pyramid' },
        isEditMode: true,
      });
      expect(screen.getByText(/needs at least 3 columns/)).toBeTruthy();
    });
  });

  describe('sidebar', () => {
    const fields = (data) =>
      graphSchema({ data }).fieldsets.flatMap((f) => f.fields);

    it('asks for the data first, alone', () => {
      expect(fields({})).toEqual(['dataSource']);
      expect(fields({ dataSource: 'file' })).toEqual(['dataSource', 'csvFile']);
      expect(fields({ dataSource: 'paste' })).toEqual([
        'dataSource',
        'pastedTable',
      ]);
    });

    it('offers the picker once there is data, then the view’s options', () => {
      const withFile = fields({ csvFile: craTable.csvFile });
      expect(withFile).toContain('chartType');
      expect(withFile).not.toContain('title');
      const bar = fields({ ...craTable, chartType: 'bar' });
      expect(bar).toEqual(
        expect.arrayContaining([
          'showDataLabels',
          'xLabel',
          'title',
          'delimiter',
        ]),
      );
      expect(bar).not.toContain('statColumns');
      const stats = fields({ ...craTable, chartType: 'stats' });
      expect(stats).toEqual(
        expect.arrayContaining(['statColumns', 'cardColor', 'statAnimationMs']),
      );
      expect(stats).not.toContain('showDataLabels');
    });

    it('offers top and bottom padding, None unless chosen', () => {
      const schema = graphSchema({ data: { ...craTable, chartType: 'pie' } });
      const look = schema.fieldsets.find((f) => f.id === 'look').fields;
      expect(look.slice(-2)).toEqual(['paddingTop', 'paddingBottom']);
      expect(schema.properties.paddingTop.placeholder).toBe('None');
      expect(schema.properties.paddingTop.default).toBeUndefined();
    });

    it('shows the older block’s saved speed by name', () => {
      const schema = graphSchema({ data: { ...craTable, chartType: 'stats' } });
      const choices = schema.properties.statAnimationMs.choices;
      expect(choices.find(([v]) => v === '1500')[1]).toBe('Normal');
    });

    it('is configured once there is data and a view', () => {
      expect(isConfigured(craTable)).toBe(true);
      expect(isConfigured({ ...craTable, chartType: undefined })).toBe(false);
      expect(isConfigured({ dataSource: 'paste', chartType: 'bar' })).toBe(
        false,
      );
    });

    it('picks a view from the picture grid', () => {
      const onChange = jest.fn();
      render(
        <IntlProvider locale="en">
          <ChartTypeWidget id="chartType" value="bar" onChange={onChange} />
        </IntlProvider>,
      );
      const bars = screen.getByRole('button', { name: 'Bars' });
      expect(bars.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(screen.getByRole('button', { name: 'Line' }));
      expect(onChange).toHaveBeenCalledWith('chartType', 'line');
      expect(screen.getByText(/Compare amounts side by side/)).toBeTruthy();
    });
  });
});
