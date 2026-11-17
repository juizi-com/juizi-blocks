/**
 * Browser only: the parts of ECharts the chart views use. Loaded with a
 * dynamic import when a chart scrolls into view (or straight away in the
 * editor), so pages without a chart never download it.
 *
 * Add a module here when a view needs one (another chart type, a
 * component such as dataZoom); the server uses the full build.
 */
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  LabelLayout,
  SVGRenderer,
]);

export default echarts;
