<template>
  <div style="display: flex; flex-direction: column; padding: 10px; height: 100%">
    <div style="height: 70px">
      <button @click="testFunc">test</button>
      <el-button @click="chooseFile">选择配置文件</el-button>
      <HandleExe />
    </div>
    <div
      ref="bingotreewrap"
      style="flex: 1; display: flex; height: 100%; overflow: hidden; margin-top: 24px"
    >
      <!-- <VirtualScrollVue
        style="width: 220px"
        :mock-data="data.mockData"
        @change-whole-num="changeWholeNum"
      /> -->
      <ElTreeV2 v-if="data.showtree" style="width: 220px" :wrapheight="data.heightTreeWrap" />
      <div
        style="
          margin-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          width: 100%;
          height: 100%;
          overflow-y: auto;
        "
      >
        <div>
          <button
            style="position: fixed; z-index: 11111111; right: 10px; top: 16px"
            @click="addEchart"
          >
            增加图表
          </button>
        </div>
        <div v-for="item in data.echartCount" :key="item.id" @dragover.prevent :draggable="true">
          <StandardWrapper
            @delete-echart="deleteEchart"
            :cardIndex="`${item.id}`"
            :refName="`visitAnalyRef-${item.id}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { buildShortUUID } from '@renderer/utils/uuid'
import { createGlobleFileInput } from '@renderer/utils'
import HandleExe from './HandleExe.vue'
import StandardWrapper from '@renderer/components/StandardWrapper/index.vue'
import ElTreeV2 from '@renderer/components/ElTreeV2/index.vue'
// import VirtualScrollVue from '@renderer/views/VirtualScrollVue.vue'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import { wholeCircleDataStore } from '@renderer/store/modules/wholeDataStore'
const userDragStore = useDragStore()
const wholeCirDataStore = wholeCircleDataStore()
const testFunc = () => {
  console.log('testFunc-------s')
}
const bingotreewrap: any = ref(null)
const data = reactive({
  showtree: false,
  heightTreeWrap: 10,
  mockData: [],
  cacheMockData: [],
  echartCount: [{ id: buildShortUUID() }]
})

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

const deleteEchart = (cardIndex) => {
  data.echartCount.splice(
    data.echartCount.findIndex((item) => item.id == cardIndex),
    1
  )
}
const addEchart = () => {
  data.echartCount.push({ id: buildShortUUID() })
}

const setInitShowCircle = (initShowFlagArr) => {
  // const arr1 = [
  //   { index: 2, title: '列表项2列表项列表项列表项列表项列表项列表项2', color: '#37A2DA' },
  //   { index: 3, title: '列表项3列表项列表项列表项列表项列表项列表项3', color: '#32C5E9' },
  //   { index: 4, title: '列表项4列表项列表项列表项列表项列表项列表项4', color: '#67E0E3' }
  // ]
  const arr2 = [] as any[]
  initShowFlagArr.forEach((element, index) => {
    // TODO 没出来线，在拖1001号线没有判断出 已存在
    arr2.push({
      index: Number(element.id),
      title: element.label,
      color: userDragStore.getColorList[index]
    })
  })
  // 第一个echart的id
  const cardIndex = data.echartCount[0]['id']
  userDragStore.setInitShowCircleData(cardIndex, arr2)
}
onMounted(async () => {
  createGlobleFileInput()
  // 设置树的高度
  data.heightTreeWrap = bingotreewrap.value.offsetHeight
  data.showtree = true
})
// TODO const runonRightEnv = isInElectron && navigator.platform === 'Win32'
// runonRightEnv &&
window.electron.ipcRenderer.on('socket-whole-circle-data-list', async (_, message) => {
  console.log('whole-circle')
  const { showCircleData } = message
  await wholeCirDataStore.setWholeCircleDataStore(showCircleData)
})
// runonRightEnv &&
window.electron.ipcRenderer.on('socket-tree-data-list', (_, message) => {
  const { initShowFlagArr } = message
  // console.log('2222222socket消息Tree-Arr===>', initShowFlagArr)
  setInitShowCircle(initShowFlagArr)
})
// if (!isInElectron) {
//   const arr: any = []
//   for (let index = 0; index < 10000; index++) {
//     arr.push({
//       title: `列表项${index}列表项列表项列表项列表项列表项列表项` + index,
//       index: index
//       // checked: false
//     })
//   }
//   data.mockData = arr
//   data.cacheMockData = arr
// }
// interface itemType {
//   title: string
//   index: number
// }
// const changeWholeNum = async (num): Promise<any> => {
//   if (num === '') {
//     data.mockData = data.cacheMockData
//   } else {
//     data.mockData = await data.cacheMockData.filter(
//       (item: itemType) => item.title.search(num) !== -1
//     )
//   }
// }
// isInElectron &&
//   window.electron?.ipcRenderer.on('vilturaldata', (_, message) => {
//     console.log('虚拟列表数据1----', message)
//     data.mockData = message
//     data.cacheMockData = message
//   })
</script>
