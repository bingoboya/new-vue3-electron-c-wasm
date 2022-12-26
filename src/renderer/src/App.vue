<template>
  <DashBoard />
  <!-- <div ref="chartRefs" :style="{ height: '280px', width: '100%' }"></div> -->
  <!-- <input type="text" v-model="data.message" />
  <button @click="postMessage">send msg</button> -->
</template>
<script setup lang="ts">
import DashBoard from '@renderer/views/DashBoard/index.vue'
// import { ref, reactive } from 'vue'
// import { useECharts } from '@renderer/hooks/web/useECharts'

// const chartRefs = ref(null)
// const { setOptions, legendSelectAction, legendUnSelectAction, getModeloptions, clearInstance } = useECharts(chartRefs)

// const data = reactive({
//   options: {
//     animationDuration: 0,
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: {
//         lineStyle: {
//           width: 1,
//           color: '#019680'
//         }
//       }
//     },
//     legend: {
//       show: false,
//       // formatter: () => {
//       //   return h('span', 'asdwdwq');
//       // },
//       // top: 30,
//       data: [
//         // { icon: 'roundRect', name: 'bingo1' },
//         // { icon: 'roundRect', name: 'bingo2' },
//       ]
//     },
//     xAxis: {
//       type: 'category',
//       boundaryGap: false,
//       // data: [...new Array(2000)].map((_item, index) => `${index}`),
//       data: [],
//       axisLabel: {
//         // interval: 0.5
//       },
//       splitLine: {
//         show: true,
//         lineStyle: {
//           width: 1,
//           type: 'solid',
//           color: 'rgba(226,226,226,0.5)'
//         }
//       },
//       axisTick: {
//         show: false
//       }
//     },
//     yAxis: [
//       {
//         type: 'value',
//         // max: 80000,
//         splitNumber: 4,
//         axisTick: {
//           show: false
//         },
//         splitArea: {
//           show: true,
//           areaStyle: {
//             color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)']
//           }
//         }
//       }
//     ],
//     grid: { left: '1%', right: '1%', top: '50px', bottom: 0, containLabel: true },
//     series: []
//   }
// })








/*
  import { sendMessage } from './worker-api'
  const data = reactive({
    message: ''
  })
  const postMessage = () => {
    sendMessage(data.message)
  }
  function demo() {
    console.log('isok')
  }
  let blob = new Blob([demo.toString() + ' demo()'], { type: 'text/javascript' })
  let worker = new Worker(URL.createObjectURL(blob))
  console.log(1111, worker)
*/
</script>
<style lang="less">
@import './assets/css/styles.less';

.wrapper {
  width: 100%;
  height: 100%;
  padding: 30px;
}
</style>
