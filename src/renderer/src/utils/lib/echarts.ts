import * as echarts from 'echarts/core'
//TODO 直接使用 echarts/dist/echarts.min 这个压缩后的代码，性能会好一点，但是下面的好多组件用不了，需要重新配置
// import * as echarts from 'echarts/dist/echarts.min'



import {
  // BarChart,
  // PieChart,
  // MapChart,
  // PictorialBarChart,
  // RadarChart
  LineChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  AriaComponent,
  ParallelComponent,
  LegendComponent,
  RadarComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  TimelineComponent,
  CalendarComponent,
  GraphicComponent
} from 'echarts/components'

import {
  // SVGRenderer
  CanvasRenderer
} from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features';

echarts.use([
  UniversalTransition,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  AriaComponent,
  ParallelComponent,
  LineChart,
  RadarComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  TimelineComponent,
  CalendarComponent,
  GraphicComponent,
  // SVGRenderer
  CanvasRenderer
  // BarChart,
  // PieChart,
  // MapChart,
  // RadarChart,
  // PictorialBarChart
])

export default echarts
