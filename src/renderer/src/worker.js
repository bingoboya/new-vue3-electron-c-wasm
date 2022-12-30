import * as Comlink from 'comlink'

// const fns = {
//   arr = [1, 2, 3, 4]
//   toUpperCase(msg) {
//     return msg.toUpperCase()
//   },
//   doHardWork() {
//     let i = 0
//     while (i < 9000000000) {
//       i++
//     }
//     return i
//   }
// }

// Comlink.expose(fns)
const avs = 'wwww'
class DataProcessor {
  arr = []
  count = 0
  wholeLen = 10000
  data = []
  wholeCircleDataMap = {}
  // xAxisData: [...Array(10000).keys()],
  constructor() {}
  clearArr() {
    this.data.length = 0
    console.log('avs', avs)
  }
  // pushWholeCircleData(originData) {
  pushArr(originData) {
    if (this.count % 1000 === 0 || this.count === 9999) {
      console.log('count', this.count)
    }
    originData.forEach((oriItem) => {
      const { id, value } = oriItem
      const getCircleValArr = this.wholeCircleDataMap[id]
      if (getCircleValArr) {
        getCircleValArr[getCircleValArr.length] = value
        // getCircleValArr[this.count + 1] = value
      } else {
        // 尝试以float64Array的数据结构传给echart,没成功 https://jsfiddle.net/zqu2tn8f/12/
        // const bufArr = new Float64Array(10000)
        // bufArr[0] = value
        // this.wholeCircleDataMap[id] = bufArr
        this.wholeCircleDataMap[id] = [value]
      }
    })
    this.count++

    if (this.count % 20 === 0) {
      // 这是一个信号，通知主线程可以更新ui了
      return { 3: 'a' }
    }
  }

  getCircleValbyId(lineIds, deleteLine) {
    const seriesVals = lineIds.map((lineItem) => {
      const { index, name, color } = lineItem
      const circleData = this.wholeCircleDataMap[index]
      return {
        name: name,
        type: 'line',
        lineStyle: {
          color: color
        },
        dimensions: {
          // type: 'float'
        },
        // encode: {
        //   x: 'date',
        //   y: 'value'
        // },
        smooth: true,
        symbol: 'none',
        sampling: 'lttb', //降采样策略
        data: circleData
      }
    })
    const len = seriesVals[0].data?.length
    const xAxisList = [...Array(len).keys()]
    if (deleteLine !== 'deleteLine') {
      const options = {
        animationDuration: 2000, // TODO 增加线时加上动画
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisList
        },
        series: seriesVals
      }
      return { options }
    } else {
      const options = {
        animationDuration: 0, // TODO 设置成0时，删除图中某条折线时，视图更新出现刷新的动画
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisList
        },
        series: seriesVals
      }
      return { options }
    }
  }
  getArr() {
    console.log('arr--->', this.data, this.count, this.wholeCircleDataMap)
    return this.arr
  }
  toUpperCase(msg) {
    return msg.toUpperCase()
  }
  doHardWork() {
    // let i = 0
    // while (i < 9000000000) {
    //   i++
    // }
    for (let i = 0; i <= 9000000; i++) {
      this.arr.push(i)
    }
    // return i
  }
  insert(...s) {
    this.arr.push(...s)
  }

  search(target) {
    const ans = []
    for (const value of this.arr) {
      if (value.str.match(target)) {
        ans.push(value)
      }
    }

    return ans
  }
}

Comlink.expose(DataProcessor)

// self.addEventListener('message', (e) => {
//   console.log('worker got', e)

//   self.postMessage(e.data.toUpperCase())
// })
