import { defineStore } from 'pinia'
const colorList = [
  '#37A2DA',
  '#32C5E9',
  '#67E0E3',
  '#9FE6B8',
  '#FFDB5C',
  '#ff9f7f',
  '#fb7293',
  '#E062AE',
  '#E690D1',
  '#e7bcf3',
  '#9d96f5',
  '#8378EA',
  '#96BFFF'
]
const randomColor = () => {
  let r = Math.floor(Math.random() * 256)
  let g = Math.floor(Math.random() * 256)
  let b = Math.floor(Math.random() * 256)
  return `rgb(${r},${g},${b})`
}
for (let i = 0; i < 100; i++) {
  colorList.push(randomColor())
}
export const useDragStore = defineStore({
  id: 'app-drag',
  state: () => ({
    // 存放 页面上有几个echarts,每个echarts分别对应有哪几条曲线
    cacheEchartDataMap: new Map(),
    // 最新添加的数据
    newAddValue: [] as any[],
    // 最新添加到该Card中
    newAddCardIndex: '',
    actionType: 'add',
  }),
  // TODO  添加曲线后，切换到其他组件后，状态还没有保存
  getters: {
    getCacheEchartDataMap(): any {
      // this.cacheEchartDataMap.set('bingogo', '就是bingo');
      // console.log('this.cacheEchartDataMap-', this.cacheEchartDataMap);
      return this.cacheEchartDataMap
    },
    getColorList() {
      return colorList
    }
  },
  actions: {
    setInitShowCircleData(key, valueArr) {
      this.newAddCardIndex = key
      this.newAddValue = [...valueArr]
      this.cacheEchartDataMap.set(key, valueArr)
    },
    async setCacheEchartDataMap(key, value: string) {
      this.actionType = 'add'
      console.log('key, value', key, value)
      let valueArr: any = []
      const [itemIndex, itemTitle] = value.split(',')
      // console.log(1111111, Number(itemIndex), itemTitle);
      const cacheValue = {
        index: Number(itemIndex),
        title: itemTitle,
        color: ''
      }
      const cardVal = this.getCacheEchartDataMap.get(key)
      console.log('cardVal', cardVal)
      if (cardVal) {
        const hasKey = cardVal.find((val) => val.index === Number(itemIndex))
        // console.log('mutation---cardVal', cardVal, hasKey);
        if (hasKey) {
          alert('该曲线图中已经存在该曲线！')
          return
        }
      }
      // console.log('mutation-----', 1111111122222);
      const hasKey = this.getCacheEchartDataMap.has(key)
      // console.log('hasKey', hasKey);
      if (hasKey) {
        // console.log(8888888888, cardVal);
        const carv = cardVal.map((item) => item.color)
        const as = new Set(carv)
        const setColor = colorList.filter((x) => !as.has(x))
        // console.log('setColor', setColor);
        cacheValue.color = setColor[0]
        valueArr = [...this.getCacheEchartDataMap.get(key), cacheValue]
      } else {
        cacheValue.color = colorList[0]
        valueArr = [cacheValue]
      }
      this.newAddValue = [cacheValue]
      this.newAddCardIndex = key
      this.cacheEchartDataMap.set(key, valueArr)
    },
    async deleteCacheEchartDataMap(cardIndex, lineName) {
      this.actionType = 'delete'
      // console.log(22222, cardIndex, lineName);
      const cardVal = this.getCacheEchartDataMap.get(cardIndex)
      const restlist = cardVal.filter(
        (cardItem) => cardItem.index != parseInt(lineName.replace(/[^\d]/g, ''))
      )
      this.cacheEchartDataMap.set(cardIndex, restlist)
      // console.log('deleteCacheEchart-----DataMap', cardVal, this.cacheEchartDataMap);
    }
  }
})
