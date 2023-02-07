<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable prettier/prettier -->
<template>
  <div style="display: flex; flex-direction: column; padding: 10px; height: 100%">
    <!-- <div style="height: 70px"> -->
      <HandleExe />
    <!-- </div> -->
    <div ref="bingotreewrap" style="flex: 1; display: flex; height: 100%; overflow: hidden; margin-top: 8px">
      <ElTreeV2 v-if="data.showtree" style="width: 220px" :wrapheight="data.heightTreeWrap" />
      <div style="padding: 6px;margin-left: 20px; display: flex; flex-direction: column; gap: 20px; flex: 1; width: 100%; height: 100%; overflow-y: auto;">
        <div>
          <button style="position: fixed; z-index: 3; right: 10px; top: 16px" :disabled="data.addEchartBtnDisabled" @click="addEchart">
            增加图表
          </button>
        </div>
        <StandardWrapper v-for="item in data.echartCount" :key="item.id" @delete-echart="deleteEchart" :toolbarArray="data.toolbarArray.get(item.id)"
          :cardIndex="`${item.id}`" :updateCout="data.update" @updata-tool-bar-arr="updataToolBarArr" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  remoteFunUpdateFlag
  // setNewtoolbarsMap
} from '@renderer/worker-api'
import { reactive, onMounted, ref } from 'vue'
import {
  remoteFunInitToolBars
  // getCicleDataByToolBars
} from '@renderer/worker-api'
import { buildShortUUID } from '@renderer/utils/uuid'
import HandleExe from './HandleExe.vue'
import StandardWrapper from '@renderer/components/StandardWrapper/index.vue'
import ElTreeV2 from '@renderer/components/ElTreeV2/index.vue'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import * as Comlink from 'comlink'
const userDragStore = useDragStore()
const data = reactive({
  addEchartBtnDisabled: false,
  showtree: false,
  heightTreeWrap: 10,
  echartCount: [{ id: buildShortUUID() }] as any[],
  toolbarArray: new Map(),
  update: 0
})
// 将 Map 结构转换为数组
// const mapToArray = (map) => {
//   return Array.from(map, ([key, value]) => ({ key, value }))
// }
const updataToolBarArr = async ([cardIndex, arg]) => {
  // data.toolbarArray.set(cardIndex, arg)
  // const arr = JSON.parse(JSON.stringify(mapToArray(data.toolbarArray)))
  // console.log('data.toolbarArray', data.toolbarArray, arr)
  // setNewtoolbarsMap(arr)
}
const updateFlag = async (_arg) => {
  data.update += 1
}
// let timer: any = null
onMounted(async () => {
  // timer = setInterval(() => {
  //   setTimeout(() => {
  //     data.update += 1
  //   }, 0)
  // }, 1000)
  // 挂载监听函数，初始化第一张图表中要显示的曲线的toolBarArr
  remoteFunInitToolBars(Comlink.proxy(initToolBarArr))
  remoteFunUpdateFlag(Comlink.proxy(updateFlag))
  // 设置树的高度
  data.heightTreeWrap = bingotreewrap.value.offsetHeight
  data.showtree = true
})
const initToolBarArr = (arg) => {
  setInitShowCircle(arg)
}
const setInitShowCircle = (initShowFlagArr) => {
  const arr2 = [] as any[]
  // console.log('initShowFlagArr', initShowFlagArr)
  initShowFlagArr.forEach((element, index) => {
    const { id, label, firstNode, secondNode } = element
    arr2.push({
      index: Number(id),
      title: label,
      firstNode,
      secondNode,
      color: userDragStore.getColorList[index]
    })
  })
  // 第一个echart的id
  const cardIndex = data.echartCount[0] && data.echartCount[0]['id']
  data.toolbarArray.set(cardIndex, arr2)
  console.log('setInitShowCircle', data.toolbarArray)
}

const bingotreewrap: any = ref(null)

const deleteEchart = (cardIndex) => {
  data.echartCount.splice(
    data.echartCount.findIndex((item) => item.id == cardIndex),
    1
  )
}

const addEchart = () => {
  data.addEchartBtnDisabled = true
  data.echartCount.push({ id: buildShortUUID() })
  setTimeout(() => {
    data.addEchartBtnDisabled = false
  }, 1000)
}
</script>
<style lang="less">
// iframe {
//   border: 0;
//   resize: both;
//   overflow: auto;
//   width: 100%;
//   height: 100%;
// }
</style>
