<!-- eslint-disable prettier/prettier -->
<template>
  <div ref="cartParent" class="bingo-chart" style="border: 1px solid #e1e1e1;position: relative;border-radius: 4px;" :draggable="false" @dragover.prevent @dragenter.prevent="($event) => $event.preventDefault()" @drop="ondropp($event)">
    <legendDragVue ref="legendDragComp" @get-circle-set-options="getCircleSetOptions" @set-parse-list="setParseList" :toolbarsList="state.toolbarsList" @toggle-legend="toggleLegend" @delete-line="deleteLine"/>
    <div :draggable="false" style="border-radius: 4px 4px 0 0; overflow: hidden; padding: 0 4px;user-select: none;background: #f5f5f5; display: flex; justify-content: space-between; align-items: center;">
      <div>chart_{{ cardIndex }}</div>
      <button @click="deleteCurrEchart(cardIndex)">🚮</button>
    </div>
    <!-- <div class="noscroll" style="display: flex; background: transparent; position: absolute; z-index: 2; width: calc(100% - 48px); gap: 10px; overflow-x: auto;">
      <div v-for="item in state.toolbarsList" :key="item.name" style="display: flex; padding: 0 4px; border-radius: 4px" :style="{ background: item.color }">
        <div style="white-space: nowrap; display: flex; align-items: center" @click="toggleLegend(item)">
          <div :style="{ backgroundColor: !item.toggle ? 'rgba(0, 0, 0, 0.3)' : null }">{{ item.name }}</div>
        </div>
        <div @click="deleteLine(item)" style="background: #c89494; width: 18px; text-align: center">xx</div>
      </div>
    </div> -->
    <div ref="chartRefs" :style="{ height: '380px', width: '100%' }" style="border-radius: 0 0 4px 4px;background: #f5f5f5"></div>
  </div>
</template>
<script setup>
/*
图表下载成图片，可以考虑截图，所见即所得  
legendlist和图表： 在右布局，在上或者在下部剧（不折行），悬浮布局，没有legend
legend： 当前曲线的-》显示隐藏，编辑文案，曲线的粗细，颜色，删除，虚线实线等线类型，放到上面单独模块操作
设置：横纵轴名称，单位，是否显示
*/
import legendDragVue from './legendDrag.vue'
import { getCircleValbyId } from '@renderer/worker-api'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import { basicProps } from './props'
import { reactive, ref } from 'vue'
import { useECharts } from '@renderer/hooks/web/useECharts'
import { checkWebGLFunc } from '@renderer/utils'

const userDragStore = useDragStore()
const emit = defineEmits(['deleteEchart', 'updataToolBarArr'])
const props = defineProps({
  ...basicProps,
  cardIndex: {
    type: String
  },
  toolbarArray: {
    type: Array,
    default: () => []
  },
  updateCout: {
    type: Number,
    default: 0
  }
})

const chartRefs = ref(null)
const legendDragComp = ref(null)
const { setOptions, legendSelectAction, legendUnSelectAction, clearInstance } =
  useECharts(chartRefs)
onMounted(async () => {
  setInitOptions()
})

const setInitOptions = async () => {
  clearInstance()
  state.options = {
    // 开启数据缓存 官方文档没找到这个配置
    progressive: true,
    // animationDuration: 2000, // TODO 设置成0时，删除图中某条折线时，视图更新出现刷新的动画
    tooltip: {
      formatter: function (params) {
        // params 数组包含了当前鼠标位置所有折线的数据
        console.log(2222, params)
        var res = '时间: ' + params[0].name + '<br/>'
        for (var i = 0; i < params.length; i++) {
          res += params[i].seriesName + ' : ' + params[i].value + '<br/>'
        }
        return res
      },
      textStyle: {
        color: '#fff'
      },
      backgroundColor: '#04040480',
      borderColor: '#ffffff00',
      // alwaysShowContent: true,
      trigger: 'axis',
      // order: 'valueDesc', // 多系列提示框浮层排列顺序, [根据数据值, 降序排列]
      renderMode: 'html',
      // confine: true,
      appendToBody: true,
      // position: function (pt) {
      //   return [pt[0], '10%'];
      // }
      // axisPointer: {
      //   type: 'cross'
      // }
    },
    grid: {
      left: 50,
      right: 40
    },
    toolbox: {
      top: 20,
      feature: {
        dataZoom: {
          // show: true,
          yAxisIndex: 'none'
        },
        // restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        show: true,
        moveOnMouseMove: true,
        filterMode: 'empty'
      }
      // ,{
      //   type: 'slider',
      //   startValue: 0,
      //   endValue: 100,
      //   filterMode: 'filter'
      // }
    ],
    legend: {
      show: false,
      // formatter: () => {
      //   return h('span', 'asdwdwq');
      // },
      // top: 30,
      data: [
        // { icon: 'roundRect', name: 'bingo1' },
        // { icon: 'roundRect', name: 'bingo2' },
      ]
    },
    yAxis: {
      // boundaryGap: [0, '50%'],
      // type: 'category'
      // type: 'value'
    },
    xAxis: {
      // type: 'category',
      // // type: 'value',
      // // boundaryGap: false,
      // // data: []
      // // data: [...Array(10000).keys()],
      // data: generatorXaixList(5000, 0.5)
    },
    series: []
  }
  if (checkWebGLFunc()) {
    // 使用 WebGL 渲染图表
    // renderer: 'webgl', // 官方文档没找到这个配置
    state.options['renderer'] = 'webgl'
  }
  setOptions(state.options, false, [], true)
}
const state = reactive({
  toolbarsList: [],
  options: {
    series: []
  }
})
const ondropp = async (e) => {
  const transferData = e.dataTransfer.getData('text')
  if (!transferData) return
  const { index, label, firstNode, secondNode } = JSON.parse(transferData)
  const newBars = legendDragComp.value.getBarsList()
  const existLine = newBars.find((item) => item.index === Number(index))
  if (existLine) {
    console.error('该曲线图中已经存在该曲线！')
    return
  }
  const colorList = userDragStore.getColorList
  const carv = newBars.map((item) => item.color)
  const as = new Set(carv)
  const lineColor = colorList.filter((x) => !as.has(x))[0]
  // state.toolbarsList.push({
  //   index: Number(index),
  //   title: label,
  //   color: lineColor,
  //   name: `#${firstNode}.${secondNode}.${label}`,
  //   toggle: true
  // })
  legendDragComp.value.addLegend({
    index: Number(index),
    title: label,
    color: lineColor,
    name: `#${firstNode}.${secondNode}.${label}`,
    toggle: true
  })
  console.log(11111, {
    index: Number(index),
    title: label,
    color: lineColor,
    name: `#${firstNode}.${secondNode}.${label}`,
    toggle: true
  })
}
watch(
  () => props.toolbarArray,
  (newValue, _oldValue) => {
    newValue.forEach((item) => {
      const { firstNode, secondNode, title } = item
      item.toggle = true
      item.name = `#${firstNode}.${secondNode}.${title}`
    })
    state.toolbarsList = newValue
    console.log('props.toolbarArray', state.toolbarsList)
  }
)
watch(
  () => props.updateCout,
  async (_newValue, _oldValue) => {
    if (state.toolbarsList.length > 0) {
      await getCircleSetOptions(parseList)
    }
  }
)
// 存储state.toolbarsList为序列化的结构，在getCircleValbyId使用时不需要每次再对state.toolbarsList序列化了
let parseList = []
const setParseList = (val) => {
  parseList = val
}
const getCircleSetOptions = async (parseToolBars) => {
  const options = (await getCircleValbyId(parseToolBars)) || {}
  const objectString = new TextDecoder().decode(options)
  const object = JSON.parse(objectString)
  // console.log(434344, options, object)
  setOptions(object, false, [], true)
  // setOptions(options, false)
}

const toggleLegend = (curLengend) => {
  // 设置图例显示隐藏
  const { name, index, toggle } = curLengend
  toggle ? legendSelectAction(`${name}-${index}`) : legendUnSelectAction(`${name}-${index}`)
}

const deleteCurrEchart = (cardIndex) => {
  emit('deleteEchart', cardIndex)
  clearInstance()
}

const deleteLine = async (deletedBars) => {
  if (deletedBars.length === 0) {
    await setOptions({ series: [] }, false, ['series'])
    return
  }
  const delParseList = JSON.parse(JSON.stringify(deletedBars))
  const options = (await getCircleValbyId(delParseList, 'deleteLine')) || {}
  const objectString = new TextDecoder().decode(options)
  const object = JSON.parse(objectString)
  // 删除线时清掉原来的chart实例，重新根据options的参数实例charts(参数传true，options的数据需重新构建)
  await setOptions(object, false, ['series'])
}
</script>
<!-- <style lang="less">
iframe {
  border: 0;
  resize: both;
  overflow: auto;
  width: 100%;
  height: 240px;
}
</style> -->
<style lang="less" scoped>
.bingo-chart {
  &:hover {
    -webkit-transform: translateY(-1px);
    -ms-transform: translateY(-1px);
    transform: translateY(-1px);
    -webkit-box-shadow: 0 0 2px #999;
    box-shadow: 0 0 2px #999;
    -webkit-transition: all 0.3s ease-out;
    transition: all 0.3s ease-out;
  }
}
.noscroll::-webkit-scrollbar {
  // display: none;
  height: 4px;
}
</style>
