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
import { pushArr, pushBetyArr } from '@renderer/worker-api'
import { reactive, onMounted, ref } from 'vue'
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
  // date: [] as any[],
  // data: [] as any[],
  // data1: [] as any[],
  // data2: [] as any[],
  // data3: [] as any[],
  // data4: [] as any[],
  // count: 0,
  // timer: null,
  // xAxisData: [...Array(10000).keys()],
  options: {} as any,
  optionsMap: new Map(),
  update: 0
})
// const addData = (shift) => {
//   now = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/')
//   state.date.push(now as never)
//   // state.data.push((2 - 0.4) * 10 + state.data[state.data.length - 1])
//   // state.data1.push((2 - 0.4) * 10 + state.data1[state.data1.length - 1])
//   // state.data2.push((2 - 0.4) * 10 + state.data2[state.data2.length - 1])
//   // state.data3.push((2 - 0.4) * 10 + state.data3[state.data3.length - 1])
//   // state.data4.push((2 - 0.4) * 10 + state.data4[state.data4.length - 1])
//   if (shift) {
//     // state.date.shift();
//     // state.data.shift();
//     // state.data1.shift()
//     // state.data2.shift()
//     // state.data3.shift()
//     // state.data4.shift()
//   }
//   now = new Date(+new Date(now) + oneDay)
// }
// let timer = ref(null) as any
// const calcStart = () => {
//   let count = 0
//   clearInterval(timer)
//   timer = setInterval(() => {
//     // console.log(count)
//     if (count >= 5000) {
//       clearInterval(timer)
//       console.log(`输出：${count} 次`)
//       return
//     }
//     // const showCircleData =  [
//     //   Math.random(),
//     //   Math.random(),
//     //   Math.random(),
//     //   Math.random(),
//     //   Math.random(),
//     //   Math.random()
//     // ]
//     state.date.push(count)
//     state.data.push(Math.random())
//     state.data1.push(Math.random())
//     state.data2.push(Math.random())
//     state.data3.push(Math.random())
//     state.data4.push(Math.random())
//     const options = {
//       animationDuration: 2000,
//       tooltip: {
//         trigger: 'axis'
//         // position: function (pt) {
//         //   return [pt[0], '10%'];
//         // }
//       },
//       toolbox: {
//         top: 20,
//         feature: {
//           dataZoom: {
//             show: true,
//             yAxisIndex: 'none'
//           },
//           restore: {},
//           saveAsImage: {}
//         }
//       },
//       dataZoom: [
//         {
//           type: 'inside',
//           start: 0,
//           end: 10,
//           zoomOnMouseWheel: false //设置鼠标滚轮不能触发缩放
//         },
//         {
//           start: 0,
//           end: 10
//         }
//       ],
//       xAxis: {
//         type: 'category',
//         boundaryGap: false,
//         data: state.date
//       },
//       yAxis: {
//         boundaryGap: [0, '50%'],
//         type: 'value'
//       },
//       series: [
//         {
//           name: '成交',
//           type: 'line',
//           smooth: true,
//           symbol: 'none',
//           sampling: 'lttb', //降采样策略
//           data: state.data
//         },
//         {
//           name: '成交1',
//           type: 'line',
//           smooth: true,
//           symbol: 'none',
//           sampling: 'lttb', //降采样策略
//           data: state.data1
//         },
//         {
//           name: '成交2',
//           type: 'line',
//           smooth: true,
//           symbol: 'none',
//           sampling: 'lttb', //降采样策略
//           data: state.data2
//         },
//         {
//           name: '成交3',
//           type: 'line',
//           smooth: true,
//           symbol: 'none',
//           sampling: 'lttb', //降采样策略
//           data: state.data3
//         },
//         {
//           name: '成交4',
//           type: 'line',
//           smooth: true,
//           symbol: 'none',
//           sampling: 'lttb', //降采样策略
//           data: state.data4
//         }
//       ]
//     }
//     // addData(true)
//     state.options = options
//     count++
//   }, 60)
// }
window.electron.ipcRenderer.on('socket-wholecircle-data-list-inmac', async (_, showCircleData) => {
  // const { showCircleData } = message
  const workoptions = await pushArr(showCircleData)
  if (workoptions) {
    // state.options = workoptions
    state.update += 1
  }
  // const [data, data1, data2, data3, data4] = showCircleData
  // state.date.push(count)
  // state.data.push(data)
  // state.data1.push(data1)
  // state.data2.push(data2)
  // state.data3.push(data3)
  // state.data4.push(data4)
  // console.log('showCircleData', showCircleData)
  // const options = {
  // animationDuration: 2000,
  // tooltip: {
  //   trigger: 'axis'
  //   // position: function (pt) {
  //   //   return [pt[0], '10%'];
  //   // }
  // },
  // toolbox: {
  //   top: 20,
  //   feature: {
  //     dataZoom: {
  //       show: true,
  //       yAxisIndex: 'none'
  //     },
  //     restore: {},
  //     saveAsImage: {}
  //   }
  // },
  // dataZoom: [
  //   {
  //     type: 'inside',
  //     start: 0,
  //     end: 10,
  //     zoomOnMouseWheel: false //  设置鼠标滚轮不能触发缩放
  //   },
  //   {
  //     start: 0,
  //     end: 10
  //   }
  // ],
  // xAxis: {
  //   type: 'category',
  //   boundaryGap: false,
  //   data: state.date
  // },
  // yAxis: {
  //   boundaryGap: [0, '50%'],
  //   type: 'value'
  // },
  // if (count % 20 === 0) {
  //   // electron主进程推送数据是20ms一次，这里拦截后计数推20次(20ms*20次=200ms更新echarts)后再推给echarts更新视图，100ms更新也不卡，但是页面上echarts数量多了之后会有点卡
  //   // console.log('count', count)
  //   const moveDistance = (count / state.xAxisData.length) * 100
  //   state.options = {
  //     dataZoom: [
  //       {
  //         type: 'inside',
  //         filterMode: 'filter',
  //         start: 0 + moveDistance - 10, // 设置【内置型数据区域缩放组件】开始位置 百分比
  //         end: 10 + moveDistance, // 设置【内置型数据区域缩放组件】结束位置 百分比
  //         zoomOnMouseWheel: false //  设置鼠标滚轮不能触发缩放
  //       },
  //       {
  //         start: 0,
  //         end: 10
  //       }
  //     ],
  //     series: [
  //       {
  //         name: '成交',
  //         type: 'line',
  //         smooth: true,
  //         symbol: 'none',
  //         sampling: 'lttb', //降采样策略
  //         data: state.data
  //       },
  //       {
  //         name: '成交1',
  //         type: 'line',
  //         smooth: true,
  //         symbol: 'none',
  //         sampling: 'lttb', //降采样策略
  //         data: state.data1
  //       },
  //       {
  //         name: '成交2',
  //         type: 'line',
  //         smooth: true,
  //         symbol: 'none',
  //         sampling: 'lttb', //降采样策略
  //         data: state.data2
  //       },
  //       {
  //         name: '成交3',
  //         type: 'line',
  //         smooth: true,
  //         symbol: 'none',
  //         sampling: 'lttb', //降采样策略
  //         data: state.data3
  //       },
  //       {
  //         name: '成交4',
  //         type: 'line',
  //         smooth: true,
  //         symbol: 'none',
  //         sampling: 'lttb', //降采样策略
  //         data: state.data4
  //       }
  //     ]
  //   }
  // }
  // }
  // state.options = options
  // console.log('testechart====>', state.count)
})
window.electron.ipcRenderer.on('socket-wholecircle-data-inwindows', async (_, showCircleData) => {
  const workoptions = await pushBetyArr(showCircleData)
  if (workoptions) {
    // state.options = workoptions
    state.update += 1
  }
})
// TODO const runonRightEnv = isInElectron && navigator.platform === 'Win32'
// runonRightEnv &&
// window.electron.ipcRenderer.on('socket-whole-circle-data-list', async (_, message) => {
//   const { showCircleData } = message
//   console.log(1111111)
//   // data.echartCount.
//   // console.log(
//   //   'whole-circle',
//   //   showCircleData,
//   //   data.echartCount,
//   //   wholeCirDataStore.getWholeCircleDataListStore
//   // )
//   await wholeCirDataStore.setWholeCircleDataStore(showCircleData)
// })
// runonRightEnv &&
window.electron.ipcRenderer.on('socket-tree-data-list', (_, message) => {
  const { initShowFlagArr } = message
  console.log('2222222socket消息Tree-Arr===>', initShowFlagArr)
  setInitShowCircle(initShowFlagArr)
})

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

onMounted(async () => {
  // for (let i; i <= 2000000; i++) {
  //   addData(true)
  // }
  // console.log(11111111, state.data)
  createGlobleFileInput()
  // 设置树的高度
  data.heightTreeWrap = bingotreewrap.value.offsetHeight
  data.showtree = true
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
<style lang="less">
iframe {
  border: 0;
  resize: both;
  overflow: auto;
  width: 100%;
  height: 100%;
}
</style>
