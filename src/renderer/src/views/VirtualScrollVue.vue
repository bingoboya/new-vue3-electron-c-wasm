<template>
  <div ref="viturlawrap">
    <el-input v-model="data.checkedData" style="margin-bottom: 20px" @input="filterInput">
      <template #prepend>
        <el-button :icon="Search" />
      </template>
    </el-input>
    <!-- <div style="height: 50px; over-flow: hidden; overflow-y: auto" contenteditable="true"
      >checked::{{ data.checkedTrueItemList.map((val) => val.index) }}</div
    > -->
    <div
      v-if="props.mockData.length == 0"
      style="
        height: 100%;
        background: #efeceda3;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      没有数据
    </div>
    <div
      v-if="props.mockData.length > 0"
      ref="vsScrollComp"
      style="width=100%;height: 100%;display: flex; background-color: #fffefe8a; justify-content: center"
    >
      <VScroll
        :item-height="80"
        :items="props.mockData"
        :height="data.vScrollHeight"
        :width="'100%'"
        :bench="10"
      >
        <template #default="{ item }">
          <div
            class="ggobin"
            style="
              color: #383030;
              border-bottom: 0px solid ;
              border-radius: 4px;
              border: 1px solid rgb(231, 226, 226);
              padding: 10px 8px;
            "
            @click="clickItem(item)"
            @mouseover="mouseover"
            @mouseout="mouseout"
          >
            <div
              style="
                width: 100%;
                height: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                pointer-events: none;
              "
            >
              {{ item.title }}--{{ item.index }}
            </div>
          </div>
        </template>
      </VScroll>
    </div>
    <!-- <el-backtop :bottom="100">
      <div
        style="
          height: 100%;
          width: 100%;
          background-color: var(--el-bg-color-overlay);
          box-shadow: var(--el-box-shadow-lighter);
          text-align: center;
          line-height: 40px;
          color: #1989fa;
        "
      >
        UP
      </div>
    </el-backtop> -->
  </div>
</template>
<script setup>
import { Search } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { VScroll } from '@renderer/components/VirtualScroll/index'
const emit = defineEmits(['changeWholeNum'])
const props = defineProps({
  mockData: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const vsScrollComp = ref(null)
const viturlawrap = ref(null)
const data = reactive({
  timer: null,
  vScrollHeight: 300,
  checkedData: '',
  checkedItemsList: [],
  checkedTrueItemList: []
})
const mouseout = (e) => {
  e.target.style.background = ''
  let cusTooltip = document.querySelector('#cusTooltip')
  cusTooltip.style.display = 'none'
}
const mouseover = (e) => {
  const { top, bottom } = e.target.getBoundingClientRect()
  e.target.style.background = '#e0e0e0'
  let cusTooltip = document.querySelector('#cusTooltip')
  cusTooltip.style.display = 'block'
  const _html = `<div class="dabingo">${e.target.textContent}</div>`
  cusTooltip.innerHTML = _html
  const { height: tooltipHeight } = cusTooltip.getBoundingClientRect()
  cusTooltip.style.position = 'absolute'
  cusTooltip.style.width = '220px'
  cusTooltip.style.pointerEvents = 'none'
  if (top < tooltipHeight) {
    cusTooltip.style.top = `${bottom + 10 + 14}px`
    document.querySelector('.dabingo').classList.add('dabingoup')
  } else {
    cusTooltip.style.top = `${top - tooltipHeight - 12}px`
    document.querySelector('.dabingo').classList.add('dabingodown')
  }
}
const filterInputDebounce = useDebounceFn((newValue) => {
  emit('changeWholeNum', newValue)
}, 500)
const filterInput = (val) => {
  filterInputDebounce(val)
}
const clickItem = (val) => {
  // data.checkedItemsList.push(val);
  console.log('clickItem', val, data.checkedItemsList)
}
watch(
  () => props.mockData,
  (n) => {
    if (n.length === 0) {
      document.querySelector('#cusTooltip').style.display = 'none'
    }
    calcVirScrollHeight()
    // data.checkedTrueItemList = n.filter((item) => item.checked)
    // emit('changeWholeNum', data.checkedTrueItemList.length)
    // console.log('data.checkedTrueItemList', data.checkedTrueItemList)
  },
  {
    deep: true
  }
)

const calcVirScrollHeight = () => {
  nextTick(() => {
    if (vsScrollComp.value == null) return
    const { height: wrapHeight, top: wrapTop } = viturlawrap.value.getBoundingClientRect()
    const { top: scrollTop } = vsScrollComp.value.getBoundingClientRect()
    data.vScrollHeight = wrapHeight - (scrollTop - wrapTop)
  })
}
const onresize = useDebounceFn(calcVirScrollHeight, 100)
onMounted(async () => {
  await nextTick()
  const custooltip = document.createElement('div')
  custooltip.id = 'cusTooltip'
  document.body.append(custooltip)
  await calcVirScrollHeight()
})
window.addEventListener('resize', onresize)
onUnmounted(() => {
  // 离开该页面需要移除这个监听的事件，不然会报错
  window.removeEventListener('resize', calcVirScrollHeight, true)
})
</script>
<style lang="less" scoped>
.ggobin {
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
}
</style>
