import * as Comlink from 'comlink'
const net = require('net')
const iconv = require('iconv-lite')

const setTreeAndTools = (wholeDataList) => {
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
    setTreeAndTools(wholeDataList)
  } else {
    DataProcessor.pushArr(showCircleData)
  }
}
const unPackageDatainWin = (data) => {
  const resArr = []
  const initShowFlagArr = []
  const cirNum = hexToInt(data.slice(4, 8))
  let index = 8
  for (let i = 0; i < cirNum; i++) {
    const short = hexToInt(data.slice(index, index + 2))
    index += 2
    const item = iconv.decode(data.slice(index, index + short), 'gbk')
    console.log('buf-gbkkkk--->', item)
    const [circleId, firstNode, secondNode, leafNode, initShowFlag] = item.split(',')
    // wholeDataList.push(item)
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
    index += short
  }
  console.log('aaa', resArr)
  DataProcessor.listenFunTree(resArr) // 设置初始左侧目录
  DataProcessor.listenFunInitTools(initShowFlagArr) // 设置初始化第一张图表中要显示的曲线的toolBarArr
  DataProcessor.treeList = resArr
}
const unPackageStreaminWin = (data) => {
  const cirNum = hexToInt(data.slice(4, 8)) // 曲线条数
  const pointNum = hexToInt(data.slice(8, 12)) // 点数
  const timePoint = hex2float(hexToInt(data.slice(16, 20))).toFixed(1) // 时间点
  // console.log(codeType, '曲线条数', cirNum, '点数', pointNum, '时间点', timePoint)
  // timePointArr这个时间点的逻辑可能不需要，待确定
  // const timePointArr = [] as any[]
  // for (let i = 0; i < pointNum; i++) {
  //   const timePoint = hex2float(hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
  //   timePointArr.push(aa)
  // }
  // console.log(3333333, timePointArr)
  let cirId = null // 曲线编号
  let index = 16 + 4 * pointNum
  const showCircleData = []
  for (let i = 0; i < cirNum - 1; i++) {
    cirId = hexToInt(data.slice(index, index + 4))
    index += 4
    for (let j = 0; j < pointNum; j++) {
      const cirVal = hex2float(hexToInt(data.slice(index, index + 4)))
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
}
const unPackageFunc = (data) => {
  const codeType = hexToInt(data.slice(2, 4))
  // console.log('code-----type', codeType)
  if (codeType == 1000) {
    //设置初始化的的侧边目录
    unPackageDatainWin(data)
  } else if (codeType == 1001) {
    // 解析所有的曲线数据流
    unPackageStreaminWin(data)
  }
}
const socketServer = net.createServer((client_sock) => {
  DataProcessor.myScoket = client_sock
  const platform = process.platform
  let runUnpackageDataFunc = null
  if (platform === 'darwin') {
    // 在mac系统下调用本地socket客户端调试开发
    runUnpackageDataFunc = testinMac
  } else {
    runUnpackageDataFunc = unPackageFunc
  }
  client_sock.on('data', function (data) {
    runUnpackageDataFunc(data)
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
const hex2float = (num) => {
  const sign = num & 0x80000000 ? -1 : 1
  const exponent = ((num >> 23) & 0xff) - 127
  const mantissa = 1 + (num & 0x7fffff) / 0x7fffff
  return sign * mantissa * Math.pow(2, exponent)
}
const hexToInt = (hexBuf) => {
  // 十六进制 转 十进制 Number('0x' + '000e')
  return Number('0x' + hexBuf.toString('hex'))
}
const IntToBytesBigEndian = (number, length) => {
  const bytes = []
  let i = length
  do {
    bytes[--i] = number & 255
    number = number >> 8
  } while (i)
  return bytes
}
const handleCircleExeFunc = (caseType = 2000, circleId = 1002) => {
  if (DataProcessor.myScoket === null) return
  //设置消息内容: 消息体长度的buffer + caseType的buffer + 点数的buffer + 选择的曲线id的buffer
  const codeTypeBuf = Buffer.from(IntToBytesBigEndian(caseType, 2)) // caseType的buffer
  const pointNumBuf = Buffer.from(IntToBytesBigEndian(1, 4)) // 点数的buffer，默认是 1
  const ciridBuf = Buffer.from(IntToBytesBigEndian(circleId, 4)) // 选择的曲线id的buffer
  const contentBuf = Buffer.concat([codeTypeBuf, pointNumBuf, ciridBuf]) // 拼接的消息体的buffer
  const contentLenBuf = Buffer.from(IntToBytesBigEndian(contentBuf.length, 2)) // 消息体buffer的长度的buffer
  const msg = Buffer.concat([contentLenBuf, contentBuf]) // 消息体长度的buffer拼接消息体的buffer
  //发送数据
  DataProcessor.myScoket.write(msg, () => {
    // console.log('数据发送成功：', msg)
  })
}
const handleExeFunc = (caseType = 2103) => {
  console.log('handleExeFunc===', caseType)
  if (DataProcessor.myScoket === null) return
  //设置消息内容: 消息体长度的buffer + caseType的buffer + 点数的buffer
  const codeTypeBuf = Buffer.from(IntToBytesBigEndian(caseType, 2)) // caseType的buffer
  const pointNumBuf = Buffer.from(IntToBytesBigEndian(1, 4)) // 点数的buffer，默认是 1
  const contentBuf = Buffer.concat([codeTypeBuf, pointNumBuf]) // 拼接的消息体的buffer
  const contentLenBuf = Buffer.from(IntToBytesBigEndian(contentBuf.length, 2)) // 消息体buffer的长度的buffer
  const msg = Buffer.concat([contentLenBuf, contentBuf]) // 消息体长度的buffer拼接消息体的buffer
  // <Buffer 39 32 31 30 32 31 31 30 30 32>
  //发送数据
  DataProcessor.myScoket.write(msg, () => {
    // console.log('数据发送成功：', msg)
  })
}
const handleSocketCommand = (command, circleId = 1002) => {
  if (process.platform === 'darwin') {
    DataProcessor.myScoket.write(command + '', () => {
      console.log('数据发送成功：')
    })
  } else {
    // 直接开始计算 case:2100 && 暂停计算 case:2101 && 继续计算 case:2102 && 退出计算 case:2103
    const justClick = [2100, 2101, 2102, 2103]
    // 选择曲线 case:2000 和 取消选择曲线 case:2001
    const clickAndParams = [2000, 2001]
    if (justClick.includes(command)) {
      handleExeFunc(command)
    }
    if (clickAndParams.includes(command)) {
      handleCircleExeFunc(command, circleId)
    }
  }
}

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
  sendSocketCommand: (command, circleId) => {
    handleSocketCommand(command, circleId)
    // DataProcessor.myScoket.write(command + '', () => {
    //   console.log('数据发送成功：')
    // })
  },
  getArr: () => {
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
  },
  getCircleValbyId: (lineIds, handleLineType) => {
    if (lineIds.length === 0) {
      const options = {
        animationDuration: 2000, // TODO 增加线时加上动画
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        series: []
      }
      return { options }
    }
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
    if (handleLineType !== 'deleteLine') {
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
