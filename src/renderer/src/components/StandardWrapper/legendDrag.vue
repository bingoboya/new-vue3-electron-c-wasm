<template>
  <div
    ref="legendChild"
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
      background-color: #ffffff69;
      z-index: 2;
      border-radius: 4px;
      cursor: move;
    "
  >
    <div
      v-for="item in state.barsList"
      :key="item.name"
      :style="{
        backgroundColor: item.color
      }"
      style="font-size: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center"
    >
      <div
        @click="handleClick(item)"
        style="flex: 1; padding: 2px 4px; overflow: hidden; border-radius: 4px 0 0 4px"
        :style="{
          backgroundColor: !item.toggle ? 'rgba(0, 0, 0, 0.3)' : null
        }"
      >
        {{ item.name }}
      </div>
      <div class="btnClose" @click="deleteLine(item)"></div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'
const emit = defineEmits(['toggleLegend', 'deleteLine'])
const props = defineProps({
  toolbarsList: {
    type: Array,
    default: () => []
  }
})
const legendChild = ref(null)

const state = reactive({
  barsList: []
})
watch(
  () => props.toolbarsList,
  (n, _o) => {
    console.log('n', n)
    state.barsList = n
  },
  {
    immediate: true,
    deep: true
  }
)
const handleClick = (item) => {
  console.log('handleClick', item)
  emit('toggleLegend', item)
}
const deleteLine = (item) => {
  console.log('deleteLine', item)
  emit('deleteLine', item)
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
  legendChild.value.draggable = true
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
