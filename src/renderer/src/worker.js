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
  betyCount = 0
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
      return 'updateUI'
    }
  }
  hex2float(num) {
    const sign = num & 0x80000000 ? -1 : 1
    const exponent = ((num >> 23) & 0xff) - 127
    const mantissa = 1 + (num & 0x7fffff) / 0x7fffff
    return sign * mantissa * Math.pow(2, exponent)
  }
  hexToInt(hexBuf) {
    // 十六进制 转 十进制 Number('0x' + '000e')
    return Number('0x' + hexBuf.toString('hex'))
  }
  aa() {
    console.log('22222222222222222222')
  }
  pushBetyArr(data) {
    this.aa()
    console.log('pushBetyArr---->', data)
    // windows下通过字节码传输数据,在worker中解码, 失败：主进程中的buffer没传过来，解码失败
    const cirNum = this.hexToInt(data.slice(4, 8)) // 曲线条数
    const pointNum = this.hexToInt(data.slice(8, 12)) // 点数
    const timePoint = this.hex2float(this.hexToInt(data.slice(16, 20))).toFixed(1) // 时间点
    console.log('曲线条数', cirNum, '点数', pointNum, '时间点', timePoint)
    // timePointArr这个时间点的逻辑可能不需要，待确定
    // const timePointArr = [] as any[]
    // for (let i = 0; i < pointNum; i++) {
    //   const timePoint = this.hex2float(this.hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
    //   timePointArr.push(aa)
    // }
    // console.log(3333333, timePointArr)
    let cirId = null // 曲线编号
    let index = 16 + 4 * pointNum
    const showCircleData = []
    for (let i = 0; i < cirNum - 1; i++) {
      cirId = this.hexToInt(data.slice(index, index + 4))
      index += 4
      for (let j = 0; j < pointNum; j++) {
        const cirVal = this.hex2float(this.hexToInt(data.slice(index, index + 4)))
        index += 4
        showCircleData.push({
          id: cirId,
          value: cirVal
        })
        // const hasCirId = initShowFlagArr.findIndex((initItem) => initItem.id == cirId)
        // if (hasCirId !== -1) {
        //   showCircleData.push({
        //     id: cirId,
        //     value: cirVal
        //   })
        // }
      }
    }
    this.pushArr(showCircleData)
    this.betyCount++
    if (this.betyCount % 20 === 0) {
      console.log('betyCount-update', this.betyCount)
      // 这是一个信号，通知主线程可以更新ui了
      return 'updateUI'
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
