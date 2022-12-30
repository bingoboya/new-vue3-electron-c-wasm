import * as echarts from 'echarts/core'

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
