<!-- eslint-disable prettier/prettier -->
<template>
  <div style="position: relative" @dragenter.prevent="($event) => $event.preventDefault()" @drop="ondropp($event)">
    <div style="background: #b2beb4; display: flex; justify-content: space-between; align-items: center;">
      <div>chart__{{ cardIndex }}</div>
      <button @click="deleteCurrEchart(cardIndex)">🚮</button>
    </div>
    <div class="noscroll" style="display: flex; background: transparent; position: absolute; z-index: 2; width: calc(100% - 48px); gap: 10px; overflow-x: auto;">
      <div
        v-for="item in state.toolbarsList"
        :key="item.name"
        style="display: flex; padding: 0 4px; border-radius: 4px"
        :style="{ background: item.color }"
      >
        <div style="white-space: nowrap; display: flex; align-items: center" @click="toggleLegend(item)">
          <div :style="{ backgroundColor: !item.toggle ? 'rgba(0, 0, 0, 0.3)' : null }">{{ item.name }}</div>
        </div>
        <div @click="deleteLine(item)" style="background: #c89494; width: 18px; text-align: center">xx</div>
      </div>
    </div>
    <!-- <VisitAnalysisStandard
      ref="curChartInstance"
      :cardIndex="cardIndex"
    /> -->
    <TestEchart
      ref="curChartInstance"
      :updataOptions="updataOptions"
    />
  </div>
</template>
<script setup>
// import * as echarts from 'echarts/core'
import VisitAnalysisStandard from './VisitAnalysisStandard.vue'
import TestEchart from './testEchart.vue'
import { useDragStore } from '@renderer/store/modules/userDraggable'
const userDragStore = useDragStore()
const emit = defineEmits(['deleteEchart'])
const props = defineProps({
  cardIndex: {
    type: String
  },
  toolbarArray: {
    type: Array,
    default: () => []
  },
  updataOptions: {
    type: Object,
    default: () => {}
  }
})
const curChartInstance = ref(null)









const state = reactive({
  toolbarsList: []
})
const ondropp = async (e) => {
  const transferData = e.dataTransfer.getData('text')
  const [lineId, lineLabel] = transferData.split(',')
  const existLine = state.toolbarsList.find((item) => item.index === Number(lineId))
  if (existLine) {
    alert('该曲线图中已经存在该曲线！')
    return
  }
  userDragStore.setCacheEchartDataMap(props.cardIndex, transferData)
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
}
watch(
  () => props.toolbarArray,
  (newValue, _oldValue) => {
    console.log('props.toolbarArray', newValue)
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
  curChartInstance.value.clickFarther(lineName, !toggle)
}

const deleteCurrEchart = (cardIndex) => {
  emit('deleteEchart', cardIndex)
  curChartInstance.value.clearInstance()
}

const deleteLine = (deleteItem) => {
  const { lineName, index } = deleteItem
  state.toolbarsList = state.toolbarsList.filter((item) => item.index !== index)
  curChartInstance.value.deleteSelectedLine(props.cardIndex, lineName)
}
</script>
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
