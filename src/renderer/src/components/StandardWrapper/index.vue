<template>
  <div
    style="position: relative"
    @dragenter.prevent="dragenterWrapper($event)"
    @drop="ondropp($event, cardIndex)"
  >
    <div
      style="
        background: #b2beb4;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <div>{{ refName }}</div>
      <button @click="deleteCurrEchart(cardIndex)">🚮</button>
    </div>
    <div
      v-if="!false"
      class="noscroll"
      style="
        display: flex;
        background: transparent;
        position: absolute;
        z-index: 2;
        width: calc(100% - 48px);
        gap: 10px;
        overflow-x: auto;
      "
    >
      <div
        v-for="item in state.lineList"
        :key="item.name"
        style="display: flex; padding: 0 4px; border-radius: 4px"
        :style="{ background: item.itemStyle.color }"
      >
        <div
          style="white-space: nowrap; display: flex; align-items: center"
          @click="toggleLegend(`${item.name}`)"
        >
          <div :style="{ backgroundColor: !aabb(item.name) ? 'rgba(0, 0, 0, 0.3)' : null }">
            {{ item.name }}
          </div>
        </div>
        <div
          @click="deleteLine(item.name)"
          style="background: #c89494; width: 18px; text-align: center"
        >
          xx
        </div>
      </div>
    </div>
    <VisitAnalysisStandard
      v-if="bingo"
      ref="bingoname"
      :cardIndex="cardIndex"
      :draggable="false"
      style="background: #d7d7d7"
    />
  </div>
</template>

<script setup>
import VisitAnalysisStandard from './VisitAnalysisStandard.vue'
import { useDragStore } from '@renderer/store/modules/userDraggable'
const emit = defineEmits(['deleteEchart'])
const userDragStore = useDragStore()
const props = defineProps({
  cardIndex: {
    type: String
  },
  refName: {
    type: String,
    default: 'dd'
  }
})
const bingo = ref(true)
const bingoname = ref(null)
const state = reactive({
  lineList: [],
  currentOptions: [],
  toggleLineShowList: []
})
const deleteCurrEchart = (cardIndex) => {
  emit('deleteEchart', cardIndex)
}
const aabb = (itemName) => {
  return state.toggleLineShowList.find((v) => v.lineName === itemName)?.toggle
}
const ondropp = (e, cardIndex) => {
  const transferData = e.dataTransfer.getData('text')
  userDragStore.setCacheEchartDataMap(cardIndex, transferData)
  // console.log('on-dropp:', cardIndex, e, transferData);
}
const dragenterWrapper = (e) => {
  e.preventDefault()
}

const toggleLegend = (legendName) => {
  // console.log('bingoname.value.getcolorOptions()', legendName);
  bingoname.value.getcolorOptions(legendName)
  // 设置图例显示隐藏
  // console.log('toggle-Legend', legendName, state.lineList, state.toggleLineShowList);
  const { toggle } = state.toggleLineShowList.find((v) => v.lineName === legendName)
  bingoname.value.clickFarther(legendName, !toggle)
  state.toggleLineShowList.forEach((item) => {
    if (item.lineName === legendName) {
      item.toggle = !item.toggle
    }
  })
}
const deleteLine = (lineName) => {
  // console.log('line-name', lineName, state.lineList);
  state.lineList = state.lineList.filter((item) => item.name !== lineName)
  bingoname.value.deleteSelectedLine(props.cardIndex, lineName)
  // userDragStore.deleteCacheEchartDataMap(props.cardIndex, lineName);
}
const subscribe = userDragStore.$subscribe(
  async (mutation, states) => {
    const { newAddValue, newAddCardIndex } = states
    // console.log(11111, newAddValue)
    if (newAddCardIndex === props.cardIndex) {
      const currentOptions = await bingoname.value.getCurOptions()
      state.currentOptions = currentOptions
      state.lineList = currentOptions.series
      newAddValue.forEach((newAddValueItem) => {
        const filterarr = state.toggleLineShowList.filter(
          (v) => v.lineName !== `bingo${newAddValueItem.index}`
        )
        state.toggleLineShowList = [
          ...filterarr,
          {
            lineName: `bingo${newAddValueItem.index}`,
            toggle: true
          }
        ]
      })
      // console.log(5555, state.toggleLineShowList)
    }
  },
  { detached: false }
)
onMounted(async () => {
  await nextTick()
  state.currentOptions = await bingoname.value.getCurOptions()
  state.lineList = state.currentOptions.series
})
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
