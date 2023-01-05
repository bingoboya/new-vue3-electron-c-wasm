<!-- eslint-disable prettier/prettier -->
<template>
  <div style="position: relative" @dragenter.prevent="($event) => $event.preventDefault()" @drop="ondropp($event)">
    <div style="background: #b2beb4; display: flex; justify-content: space-between; align-items: center;">
      <div>chart__{{ cardIndex }}</div>
      <button @click="deleteCurrEchart(cardIndex)">🚮</button>
    </div>
    <div
class="noscroll"
      style="display: flex; background: transparent; position: absolute; z-index: 2; width: calc(100% - 48px); gap: 10px; overflow-x: auto;">
      <div
v-for="item in state.toolbarsList" :key="item.name" style="display: flex; padding: 0 4px; border-radius: 4px"
        :style="{ background: item.color }">
        <div style="white-space: nowrap; display: flex; align-items: center" @click="toggleLegend(item)">
          <div :style="{ backgroundColor: !item.toggle ? 'rgba(0, 0, 0, 0.3)' : null }">{{ item.name }}</div>
        </div>
        <div @click="deleteLine(item)" style="background: #c89494; width: 18px; text-align: center">xx</div>
      </div>
    </div>
    <div ref="chartRefs" :draggable="false" :style="{ height, width }" style="background: #d7d7d7"></div>
  </div>
</template>
<script setup>
import { getCircleValbyId } from '@renderer/worker-api'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import { basicProps } from './props'
import { reactive, ref } from 'vue'
import { useECharts } from '@renderer/hooks/web/useECharts'

const userDragStore = useDragStore()
const emit = defineEmits(['deleteEchart', 'updataToolBarArr'])
const props = defineProps({
  ...basicProps,
  cardIndex: {
    type: String
  },
  toolbarArray: {
    type: Array,
    default: () => []
  },
  optionsArr: {
    type: Object,
    default: () => {}
  },
  updateCout: {
    type: Number,
    default: 0
  }
})

const chartRefs = ref(null)
const { setOptions, getModeloptions, legendSelectAction, legendUnSelectAction, clearInstance } =
  useECharts(chartRefs)
onMounted(async () => {
  setInitOptions()
})
const setInitOptions = () => {
  clearInstance()
  const options = {
    // animationDuration: 2000, // TODO 设置成0时，删除图中某条折线时，视图更新出现刷新的动画
    tooltip: {
      trigger: 'axis',
      order: 'valueDesc', // 多系列提示框浮层排列顺序, [根据数据值, 降序排列]
      renderMode: 'html',
      // confine: true,
      appendToBody: true
      // position: function (pt) {
      //   return [pt[0], '10%'];
      // }
    },
    toolbox: {
      top: 20,
      feature: {
        dataZoom: {
          show: true,
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        filterMode: 'filter',
        start: 0,
        end: 5,
        zoomOnMouseWheel: false //  设置鼠标滚轮不能触发缩放
      },
      {
        start: 0,
        end: 5
      }
    ],
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
    yAxis: {
      // boundaryGap: [0, '50%'],
      // type: 'category'
      // type: 'value'
    },
    xAxis: {
      // type: 'category',
      type: 'value',
      // boundaryGap: false,
      data: []
      // data: [...Array(10000).keys()]
    },
    series: []
  }
  setOptions(options, false)
}
const state = reactive({
  toolbarsList: []
})
const ondropp = async (e) => {
  const transferData = e.dataTransfer.getData('text')
  const [lineId, lineLabel] = transferData.split(',')
  const existLine = state.toolbarsList.find((item) => item.index === Number(lineId))
  if (existLine) {
    console.error('该曲线图中已经存在该曲线！')
    return
  }
  const colorList = userDragStore.getColorList
  const carv = state.toolbarsList.map((item) => item.color)
  const as = new Set(carv)
  const lineColor = colorList.filter((x) => !as.has(x))[0]
  state.toolbarsList.push({
    index: Number(lineId),
    title: lineLabel,
    color: lineColor,
    lineName: `bingo${lineId}`,
    name: `bingo${lineId}`,
    toggle: true
  })
  // getCircleSetOptions()
}
watch(
  () => props.updateCout,
  async (newValue, oldValue) => {
    if (state.toolbarsList.length > 0) {
      // await getCircleSetOptions()
    }
  }
)

const getCircleSetOptions = async () => {
  // console.log('getModeloptions', getModeloptions().series)
  const options = (await getCircleValbyId(JSON.parse(JSON.stringify(state.toolbarsList)))) || {}
  console.log('getCirc---leSetOptions', options)
  setOptions(options, false)
}
watch(
  () => props.optionsArr,
  (newValue, _oldValue) => {
    // console.log('监听props-options', newValue)
    setOptions(newValue, false)
  },
  {
    deep: true
  }
)
watch(
  () => state.toolbarsList,
  (newValue, _oldValue) => {
    emit('updataToolBarArr', [props.cardIndex, newValue])
  },
  {
    deep: true
  }
)
watch(
  () => props.toolbarArray,
  (newValue, _oldValue) => {
    // console.log('props.toolbarArray', newValue)
    newValue.forEach((item) => {
      ;(item.lineName = `bingo${item.index}`),
        (item.toggle = true),
        (item.name = `bingo${item.index}`)
    })
    state.toolbarsList = newValue
  }
)
const toggleLegend = (curLengend) => {
  // 设置图例显示隐藏
  const { lineName, index, toggle } = curLengend
  state.toolbarsList.forEach((item) => {
    if (item.index === index) {
      item.toggle = !toggle
    }
  })
  !toggle ? legendSelectAction(lineName) : legendUnSelectAction(lineName)
}

const deleteCurrEchart = (cardIndex) => {
  emit('deleteEchart', cardIndex)
  clearInstance()
}

const deleteLine = async (deleteItem) => {
  state.toolbarsList = state.toolbarsList.filter((item) => item.index !== deleteItem.index)
  const options =
    (await getCircleValbyId(JSON.parse(JSON.stringify(state.toolbarsList)), 'deleteLine')) || {}
  // console.log('ret----->', state.toolbarsList, seriesVals, xAxisList)
  // 删除线时清掉原来的chart实例，重新根据options的参数实例charts(参数传true，options的数据需重新构建)
  await setOptions(options, false, ['series'])
}
</script>
<!-- <style lang="less">
iframe {
  border: 0;
  resize: both;
  overflow: auto;
  width: 100%;
  height: 240px;
}
</style> -->
<style lang="less" scoped>
.noscroll::-webkit-scrollbar {
  // display: none;
  height: 4px;
}

.list-group {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-direction: column;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  border-radius: 0.25rem;
  min-height: 20px;
}

.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
  cursor: move;
}
</style>
