<template>
  <div
    ref="chartRefs"
    :draggable="false"
    :style="{ height, width }"
    style="background: #d7d7d7"
  ></div>
</template>
<script setup>
import { basicProps } from './props'
import { onMounted, nextTick, reactive, ref } from 'vue'
import { useECharts } from '@renderer/hooks/web/useECharts'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import { wholeCircleDataStore } from '@renderer/store/modules/wholeDataStore'
const wholeCirDataStore = wholeCircleDataStore()
const userDragStore = useDragStore()
const props = defineProps({
  ...basicProps,
  cardIndex: {
    type: String,
    default: 'card1'
  }
})
const chartRefs = ref(null)
const { setOptions, legendSelectAction, legendUnSelectAction, clearInstance } =
  useECharts(chartRefs)
const data = reactive({
  options: {
    animationDuration: 0,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          width: 1,
          color: '#019680'
        }
      }
    },
    legend: {
      show: false,
      // formatter: () => {
      //   return h('span', 'asdwdwq');
      // },
      // top: 30,
      data: [
        // { icon: 'roundRect', name: 'bingo1' },
        // { icon: 'roundRect', name: 'bingo2' },
      ]
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      // data: [...new Array(2000)].map((_item, index) => `${index}`),
      data: [],
      axisLabel: {
        // interval: 0.5
      },
      splitLine: {
        show: true,
        lineStyle: {
          width: 1,
          type: 'solid',
          color: 'rgba(226,226,226,0.5)'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        // max: 80000,
        splitNumber: 4,
        axisTick: {
          show: false
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)']
          }
        }
      }
    ],
    grid: { left: '1%', right: '1%', top: '50px', bottom: 0, containLabel: true },
    series: []
  }
})
userDragStore.$subscribe(
  async (mutation, state) => {
    console.log('subscribe.state', state, mutation.events)
    const { newAddValue, newAddCardIndex, actionType } = await state
    const { newValue, oldValue } = mutation.events || {}
    const flag = typeof newValue !== 'boolean' && typeof newValue !== 'string'
    if (newAddCardIndex === props.cardIndex && actionType === 'add' && flag) {
      console.log(1111111112)
      newAddValue.forEach(async (newAddValueItem) => {
        const findLine = await oldValue?.find((item) => item.index === newAddValueItem.index)
        if (findLine === undefined) {
          const lineName = `bingo${newAddValueItem.index}`
          data.options.legend.data.push({ icon: 'roundRect', name: lineName })
          // console.log('mutation-standard.vue2----在card中添加一条曲线');
          const newLine = {
            name: lineName,
            id: newAddValueItem.index,
            showLegend: true,
            symbol: 'none',
            smooth: true,
            data: getCurCircleData(newAddValueItem),
            // data: wholeCirDataStore.getWholeCircleDataListStore.get(newAddValueItem.index),
            // data: [ 111, 222, 4000, 18000, 33333, 55555 ],
            type: 'line',
            itemStyle: {
              color: newAddValueItem.color
            }
          }
          await data.options.series.push(newLine)
        }
      })
      console.log('data.options', data.options)
      // 在对应的card中添加图例和曲线
      await setOptions(data.options, false)
    }
  },
  { detached: false }
)
const getCurCircleDataIndex = (index) => {
  return wholeCirDataStore.getWholeCircleDataListStore.get(index)
}
wholeCirDataStore.$subscribe(async (mutation, state) => {
  // if (data.options.series.length === 0) return
  // const inst = getInstance()
  // console.log('data.options.series[0]', data.options.series[0])
  // const id = data.options.series[0].id
  // const dat = getCurCircleDataIndex(id)
  // inst.appendData({
  //   seriesIndex: 0,
  //   data: dat
  // })
  // inst.resize()
  // console.log('subscribe-whole-CirDataStore')
  data.options.series.forEach((serItem) => {
    serItem.data = getCurCircleDataIndex(serItem.id)
  })
  setOptions(data.options, false)
})
const getCurCircleData = (newAddValueItem) => {
  return wholeCirDataStore.getWholeCircleDataListStore.get(newAddValueItem.index)
}

const deleteSelectedLine = async (cardIndex, lineName) => {
  const { legend, series } = data.options
  // console.log('line0000name', cardIndex, lineName, series, legend);
  data.options.legend.data = legend.data.filter((val) => val.name !== lineName)
  data.options.series = series.filter((item) => item.name !== lineName)
  await setOptions(data.options, true)
  // console.log('restLineList', data.options.series);
  await userDragStore.deleteCacheEchartDataMap(cardIndex, lineName)
}
onMounted(() => {
  // 设置echartx轴长度2000s和间隔0.5s
  ;[...new Array(200)].forEach((_item, index) => {
    data.options.xAxis.data.push(...[index, index + 0.5])
  })
  setOptions(data.options)
})
const clickFarther = (val, toggle) => {
  toggle ? legendSelectAction(val) : legendUnSelectAction(val)
}
const getCurOptions = async () => {
  await nextTick()
  // console.log('data.====options', data.options);
  return data.options
}

defineExpose({
  clearInstance,
  clickFarther,
  getCurOptions,
  deleteSelectedLine
})
</script>
