<template>
  <div
    ref="legendChild"
    v-if="state.barsList.length > 0"
    :draggable="true"
    @dragstart="handleDragStart($event)"
    @drag="handleDrag($event)"
    @dragend="handleDragEnd($event)"
    style="
      overflow-y: auto;
      display: flex;
      padding: 4px;
      gap: 4px;
      flex-direction: column;
      position: absolute;
      max-height: 200px;
      min-height: 60px;
      background-color: #ffffffcf;
      z-index: 2;
      border-radius: 4px;
      cursor: move;
    "
  >
    <div
      v-for="(item, index) in state.barsList"
      :key="item.index"
      style="
        font-size: 12px;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          flex: 1;
          padding: 2px 4px;
          overflow: hidden;
          border-radius: 4px 0 0 4px;
        "
        :style="{
          backgroundColor: !item.toggle ? 'rgba(0, 0, 0, 0.3)' : null
        }"
      >
        <div
          style="display: flex; width: 34px; height: 4px; cursor: pointer; border-radius: 4px"
          @click="changeLegend(item)"
          :style="{ 'background-color': item.color }"
        ></div>
        <div
          v-if="index !== state.editIndex"
          @dblclick="handleDblClick(index)"
          @click="handleClick(item)"
          style="flex: 1"
        >
          {{ item.modifyName }}
          <!-- {{ item.modifyName === '' ? item.name : item.modifyName }} -->
        </div>
        <input
          v-if="index === state.editIndex"
          :value="item.modifyName"
          @input="(event) => (item.modifyName = event.target.value)"
          style="flex: 1"
        />
        <!-- <input
          v-if="index === state.editIndex"
          :value="item.modifyName === '' ? item.name : item.modifyName"
          @input="(event) => (item.modifyName = event.target.value)"
          style="flex: 1"
        /> -->
      </div>
      <div class="btnClose" @click="deleteLine(item)"></div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'
const emit = defineEmits(['toggleLegend', 'deleteLine', 'setParseList', 'getCircleSetOptions'])
const props = defineProps({
  toolbarsList: {
    type: Array,
    default: () => []
  }
})

const legendChild = ref(null)

const state = reactive({
  barsList: [],
  barsListBackup: [],
  editIndex: -1,
  timeoutId: null
})
// 存储state.toolbarsList为序列化的结构，在getCircleValbyId使用时不需要每次再对state.toolbarsList序列化了
// let parseList = []
// const parseList = computed(() => {
//   return JSON.parse(JSON.stringify(state.barsList))
// })
watch(
  () => state.barsList,
  (newValue, _oldValue) => {
    console.log('444433332', newValue)
    emit('setParseList', JSON.parse(JSON.stringify(newValue)))
  },
  {
    immediate: true,
    deep: true
  }
)
const changeLegend = (item) => {
  console.log(333, item, state.barsList)
  state.barsList.forEach((val) => {
    if (val.index === item.index) {
      val.toggle = !item.toggle
    }
  })
  emit('toggleLegend', item)
  // toggleLegend(item)
}
const getBarsList = () => {
  return state.barsList
}
const handleClick = (item) => {
  console.log(12, item.modifyName)
  if (state.timeoutId !== null) {
    clearTimeout(state.timeoutId)
    state.timeoutId = null
    return
  }
  state.timeoutId = setTimeout(() => {
    // 单击事件处理逻辑
    console.log('handleClick', item)
    state.editIndex = -1
    state.timeoutId = null
  }, 200)
}
const handleDblClick = (index) => {
  console.log(12)
  clearTimeout(state.timeoutId)
  state.timeoutId = null
  state.editIndex = index
}
const addLegend = (newLegend) => {
  console.log('newLegend', newLegend)
  newLegend['modifyName'] = newLegend.name
  state.barsList.push(newLegend)
  console.log('state.barsList', state.barsList)
  const parseToolBars = JSON.parse(JSON.stringify(state.barsList))
  emit('getCircleSetOptions', parseToolBars)
}
watch(
  () => props.toolbarsList,
  (n, _o) => {
    console.log('n', n)
    const a = JSON.parse(JSON.stringify(n))
    a.forEach((val) => {
      val['modifyName'] = val.name
    })
    state.barsList = a
    // state.barsListBackup = n
  },
  {
    immediate: true,
    deep: true
  }
)
const deleteLine = (deleteItem) => {
  console.log('deleteLine', deleteItem)
  state.barsList = state.barsList.filter((item) => item.index !== deleteItem.index)
  emit('deleteLine', state.barsList)
}
let parentWidth
let parentHeight
let childWidth
let childHeight
let currentX
let currentY
let initialX
let initialY
let xOffset = 0
let yOffset = 0

const handleDragStart = (e) => {
  const { clientWidth, clientHeight } = legendChild.value.parentNode
  parentWidth = clientWidth
  parentHeight = clientHeight
  childWidth = legendChild.value.clientWidth
  childHeight = legendChild.value.clientHeight
  // console.log('legendChild', parentHeight, parentWidth, childWidth, childHeight)
  initialX = e.clientX - xOffset
  initialY = e.clientY - yOffset
  // e.target.style.cursor = 'move'
}
const handleDrag = (e) => {
  // e.preventDefault()
  const maxWidth = parentWidth - childWidth
  const maxHeight = parentHeight - childHeight
  currentX = e.clientX - initialX
  currentX = currentX < 0 ? 0 : currentX > maxWidth ? maxWidth : currentX
  currentY = e.clientY - initialY
  currentY = currentY < 0 ? 0 : currentY > maxHeight ? maxHeight : currentY
  xOffset = currentX
  yOffset = currentY
  setTranslate(currentX, currentY, legendChild.value)
}
const setTranslate = (xPos, yPos, el) => {
  el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
}
const handleDragEnd = (_e) => {
  initialX = currentX
  initialY = currentY
}

onMounted(() => {
  // legendChild.value.draggable = true
})
defineExpose({
  addLegend,
  getBarsList
})
</script>
<style lang="less" scoped>
.btnClose {
  /* 自定义配置 */
  --btn-size: 16px; /* 按钮的宽高 */
  --btn-x-size: 4px; /* X号线条粗细 */
  --color: #e44a4a; /* 颜色 */
  /* 配置 END */
  position: relative;
  width: var(--btn-size);
  height: var(--btn-size);
  /* X线条旋转后会有偏移，使用 flex 进行居中对齐修正 */
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
/* 绘制X线条 */
.btnClose::after,
.btnClose::before {
  content: '';
  position: absolute;
  width: var(--btn-x-size);
  height: var(--btn-size);
  background-color: var(--color);
  border-radius: calc(var(--btn-x-size) / 2);
}
/* 两条线条各向左右分别旋转 45 度*/
.btnClose::after {
  transform: rotate(45deg);
}
.btnClose::before {
  transform: rotate(-45deg);
}
</style>
