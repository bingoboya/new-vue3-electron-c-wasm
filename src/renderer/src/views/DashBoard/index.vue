<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable prettier/prettier -->
<template>
  <div style="display: flex; flex-direction: column; padding: 10px; height: 100%">
    <div style="height: 70px">
      <button @click="testFunc">test</button>
      <!-- <button @click="calcStart">开始</button> -->
      <el-button @click="chooseFile">选择配置文件</el-button>
      <HandleExe />
    </div>
    <div ref="bingotreewrap" style="flex: 1; display: flex; height: 100%; overflow: hidden; margin-top: 24px">
      <!-- <VirtualScrollVue
        style="width: 220px"
        :mock-data="data.mockData"
        @change-whole-num="changeWholeNum"
      /> -->
      <ElTreeV2 v-if="data.showtree" style="width: 220px" :wrapheight="data.heightTreeWrap" />
      <div style=" margin-left: 20px; display: flex; flex-direction: column; gap: 20px; flex: 1; width: 100%; height: 100%; overflow-y: auto;">
        <div>
          <button style="position: fixed; z-index: 11111111; right: 10px; top: 16px" :disabled="data.addEchartBtnDisabled" @click="addEchart">
            增加图表
          </button>
        </div>
        <div v-for="item in data.echartCount" :key="item.id" @dragover.prevent :draggable="true">
          <StandardWrapper @delete-echart="deleteEchart" :toolbarArray="data.toolbarArray.get(item.id)"
            :cardIndex="`${item.id}`" :updateCout="state.update" :optionsMap="state.optionsMap.get(item.id)" :updataOptions="state.options" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  updateDataFlag
  // pushArr
  // pushBetyArr
} from '@renderer/worker-api'
import { reactive, onMounted, ref } from 'vue'
import { initToolBars } from '@renderer/worker-api'

import { buildShortUUID } from '@renderer/utils/uuid'
import { createGlobleFileInput } from '@renderer/utils'
import HandleExe from './HandleExe.vue'
import StandardWrapper from '@renderer/components/StandardWrapper/index.vue'
import ElTreeV2 from '@renderer/components/ElTreeV2/index.vue'
// import VirtualScrollVue from '@renderer/views/VirtualScrollVue.vue'
import { useDragStore } from '@renderer/store/modules/userDraggable'
// import { wholeCircleDataStore } from '@renderer/store/modules/wholeDataStore'
const userDragStore = useDragStore()
// const wholeCirDataStore = wholeCircleDataStore()

const data = reactive({
  addEchartBtnDisabled: false,
  showtree: false,
  heightTreeWrap: 10,
  mockData: [],
  cacheMockData: [],
  echartCount: [{ id: buildShortUUID() }] as any[],
  toolbarArray: new Map()
})
const state = reactive({
  options: {} as any,
  optionsMap: new Map(),
  update: 0
})

const initToolBarArr = (arg) => {
  console.log('初始的', arg)
  setInitShowCircle(arg)
}
const updateFlag = () => {
  state.update += 1
}
onMounted(async () => {
  // 挂载监听函数，初始化第一张图表中要显示的曲线的toolBarArr
  initToolBars(initToolBarArr)
  updateDataFlag(updateFlag)
  // for (let i; i <= 2000000; i++) {
  //   addData(true)
  // }
  // console.log(11111111, state.data)
  createGlobleFileInput()
  // 设置树的高度
  data.heightTreeWrap = bingotreewrap.value.offsetHeight
  data.showtree = true
})
// window.electron.ipcRenderer.on('socket-wholecircle-data-list-inmac', async (_, showCircleData) => {
//   // const { showCircleData } = message
//   const workoptions = await pushArr(showCircleData)
//   if (workoptions) {
//     // state.options = workoptions
//     state.update += 1
//   }
// })
// TODO const runonRightEnv = isInElectron && navigator.platform === 'Win32'
// runonRightEnv &&
// window.electron.ipcRenderer.on('socket-tree-data-list', (_, message) => {
//   const { initShowFlagArr } = message
//   console.log('2222222socket消息Tree-Arr===>', initShowFlagArr)
//   setInitShowCircle(initShowFlagArr)
// })


const setInitShowCircle = (initShowFlagArr) => {
  // const arr1 = [
  //   { index: 2, title: '列表项2列表项列表项列表项列表项列表项列表项2', color: '#37A2DA' },
  //   { index: 3, title: '列表项3列表项列表项列表项列表项列表项列表项3', color: '#32C5E9' },
  //   { index: 4, title: '列表项4列表项列表项列表项列表项列表项列表项4', color: '#67E0E3' }
  // ]
  const arr2 = [] as any[]
  initShowFlagArr.forEach((element, index) => {
    arr2.push({
      index: Number(element.id),
      title: element.label,
      color: userDragStore.getColorList[index]
    })
  })
  // 第一个echart的id
  const cardIndex = data.echartCount[0]['id']
  data.toolbarArray.set(cardIndex, arr2)
  // userDragStore.setInitShowCircleData(cardIndex, arr2)
  // console.log('data.rendererWholeData', data.rendererWholeData)
}

const testFunc = () => {
  console.log('testFunc-------s')
}
const bingotreewrap: any = ref(null)

const deleteEchart = (cardIndex) => {
  data.echartCount.splice(
    data.echartCount.findIndex((item) => item.id == cardIndex),
    1
  )
}
const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
isInElectron &&
  window.electron?.ipcRenderer.on('configfilePaths', (_, message) => {
    console.log('选择的配置文件----', message)
  })

const chooseFile = async () => {
  if (!isInElectron) {
    // '不在electron环境中，不能调用主进程，可以调原生api，但是由于浏览器出于安全考虑，新版本浏览器input:file或者node fs模块，都拿不到文件路径'
    // 但是这个方法可以在electron环境中运行时拿到文件路径
    document.getElementById('globleFileInput')?.click()
  } else {
    window.electron?.ipcRenderer.send('openDialog')
  }
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
