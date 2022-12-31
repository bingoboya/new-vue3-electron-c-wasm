import * as Comlink from 'comlink'
const net = require('net')
const iconv = require('iconv-lite')


const pushWholeDataStream = (wholeDataList) => {
  const resArr = []
  const initShowFlagArr = []
  wholeDataList.forEach((item) => {
    const [circleId, firstNode, secondNode, leafNode, initShowFlag] = item.split(',')
    wholeDataList.push(item)
    if (initShowFlag == 1) initShowFlagArr.push({ id: circleId, label: leafNode })
    const getFirstNode = resArr.find((firstItem) => firstItem.id === firstNode)
    if (getFirstNode === undefined) {
      const construcFirstObj = {
        id: firstNode,
        label: firstNode,
        children: [
          {
            id: secondNode,
            label: secondNode,
            children: [
              {
                id: circleId,
                label: `${leafNode}-${circleId}`
              }
            ]
          }
        ]
      }
      resArr.push(construcFirstObj)
    } else {
      const getSecondNode = getFirstNode.children.find((secondItem) => secondItem.id === secondNode)
      if (getSecondNode === undefined) {
        const construcSecondObj = {
          id: secondNode,
          label: secondNode,
          children: [
            {
              id: circleId,
              label: `${leafNode}-${circleId}`
            }
          ]
        }
        getFirstNode.children.push(construcSecondObj)
      } else {
        const construcLeafObj = {
          id: circleId,
          label: `${leafNode}-${circleId}`
        }
        getSecondNode.children.push(construcLeafObj)
      }
    }
  })
  DataProcessor.listenFunTree(resArr) // 设置初始左侧目录
  DataProcessor.listenFunInitTools(initShowFlagArr) // 设置初始化第一张图表中要显示的曲线的toolBarArr
  DataProcessor.treeList = resArr
}
const testinMac = (data) => {
  const { code, wholeDataList = [], showCircleData = [] } = JSON.parse(data.toString())
  // console.log('test==>', code, wholeDataList, showCircleData)
  DataProcessor.newcode = 4
  if (code === 2104) {
    pushWholeDataStream(wholeDataList)
  } else {
    DataProcessor.pushArr(showCircleData)
  }
}
const socketServer = net.createServer((client_sock) => {
  DataProcessor.myScoket = client_sock
  client_sock.on('data', function (data) {
    if (process.platform === 'darwin') {
      testinMac(data)
    } else {
      const codeType = DataProcessor.hexToInt(data.slice(2, 4))
      console.log('code-----type', codeType)
    }
  })
  client_sock.on('error', function (_err) {
    // console.log('error', err)
  })
})
socketServer.on('listening', function () {
  console.log('start listening...', process.platform)
})
socketServer.listen({
  port: 8099,
  host: '127.0.0.1',
  exclusive: true
})

// Comlink.expose(fns)
const DataProcessor = {
  treeList: {},
  myScoket: null,
  newcode: 2,
  arr: [],
  count: 0,
  betyCount: 0,
  wholeLen: 10000,
  wholeCircleDataMap: {},
  listenFunTree: null, // 目录树结构
  listenFunInitTools: null, //
  listenFunUpdateFlag: null, // 通知主线程更新数据
  remoteFunInitToolBars: async (cb) => {
    DataProcessor.listenFunInitTools = await cb
  },
  remoteFunUpdateFlag: async (cb) => {
    DataProcessor.listenFunUpdateFlag = await cb
  },
  remoteFunUpdateTreeList: async (cb) => {
    DataProcessor.listenFunTree = await cb
    //  cb('A string from a worker')
  },
  sendSocketCommand: (command) => {
    DataProcessor.myScoket.write(command + '', () => {
      console.log('数据发送成功：')
    })
  },
  getArr: (command) => {
    console.log('command', command, myScoket)
    // DataProcessor.myScoket.write(command + '', () => {
    //   console.log('数据发送成功：')
    // })
    console.log('net', DataProcessor.newcode, net)
    console.log('arr--->', DataProcessor.count, DataProcessor.wholeCircleDataMap)
    return DataProcessor.arr
  },
  clearArr: () => {},
  // pushWholeCircleData(originData) {
  pushArr: (originData) => {
    originData.forEach((oriItem) => {
      const { id, value } = oriItem
      const getCircleValArr = DataProcessor.wholeCircleDataMap[id]
      if (getCircleValArr) {
        getCircleValArr[getCircleValArr.length] = value
        // getCircleValArr[this.count + 1] = value
      } else {
        // 尝试以float64Array的数据结构传给echart,没成功 https://jsfiddle.net/zqu2tn8f/12/
        // const bufArr = new Float64Array(10000)
        // bufArr[0] = value
        // this.wholeCircleDataMap[id] = bufArr
        DataProcessor.wholeCircleDataMap[id] = [value]
      }
    })

    DataProcessor.count++
    // 通知主线程更新数据
    if (DataProcessor.count % 20 === 0) {
      // 这是一个信号，通知主线程可以更新ui了
      DataProcessor.listenFunUpdateFlag()
    }

    // if (this.count % 20 === 0) {
    //   // 这是一个信号，通知主线程可以更新ui了
    //   return 'updateUI'
    // }
  },
  hex2float: (num) => {
    const sign = num & 0x80000000 ? -1 : 1
    const exponent = ((num >> 23) & 0xff) - 127
    const mantissa = 1 + (num & 0x7fffff) / 0x7fffff
    return sign * mantissa * Math.pow(2, exponent)
  },
  hexToInt: (hexBuf) => {
    // 十六进制 转 十进制 Number('0x' + '000e')
    return Number('0x' + hexBuf.toString('hex'))
  },
  pushBetyArr: (data) => {
    console.log('pushBetyArr---->', data)
    // windows下通过字节码传输数据,在worker中解码, 失败：主进程中的buffer没传过来，解码失败
    const cirNum = DataProcessor.hexToInt(data.slice(4, 8)) // 曲线条数
    const pointNum = DataProcessor.hexToInt(data.slice(8, 12)) // 点数
    const timePoint = DataProcessor.hex2float(DataProcessor.hexToInt(data.slice(16, 20))).toFixed(1) // 时间点
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
      cirId = DataProcessor.hexToInt(data.slice(index, index + 4))
      index += 4
      for (let j = 0; j < pointNum; j++) {
        const cirVal = DataProcessor.hex2float(DataProcessor.hexToInt(data.slice(index, index + 4)))
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
    DataProcessor.pushArr(showCircleData)
    DataProcessor.betyCount++
    if (DataProcessor.betyCount % 20 === 0) {
      console.log('betyCount-update', DataProcessor.betyCount)
      // 这是一个信号，通知主线程可以更新ui了
      return 'updateUI'
    }
  },

  getCircleValbyId: (lineIds, deleteLine) => {
    const seriesVals = lineIds.map((lineItem) => {
      const { index, name, color } = lineItem
      const circleData = DataProcessor.wholeCircleDataMap[index]
      return {
        name: name,
        type: 'line',
        lineStyle: {
          color: color
        },
        // dimensions: {
        //   type: 'float'
        // },
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
  },
  toUpperCase: (msg) => {
    return msg.toUpperCase()
  },
  doHardWork: () => {
    // let i = 0
    // while (i < 9000000000) {
    //   i++
    // }
    for (let i = 0; i <= 9000000; i++) {
      DataProcessor.arr.push(i)
    }
    // return i
  },
  insert: (...s) => {
    DataProcessor.arr.push(...s)
  },

  search: (target) => {
    const ans = []
    for (const value of DataProcessor.arr) {
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
