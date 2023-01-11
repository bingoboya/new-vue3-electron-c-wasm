import * as Comlink from 'comlink'
const net = require('net')
const iconv = require('iconv-lite')

//TODO 问gpt: comlink使用信道进行通信 具体代码demo, 有时间再搞
// 使用信道：它的优势在于，可以在不解除序列化的情况下传输原始值，因此比使用序列化和反序列化传输数据更快。
// 将数组转换为 Map 结构
const arrayToMap = (array) => {
  return new Map(array.map(({ key, value }) => [key, value]))
}
const generatorXaixList = (len, step) => {
  const array = []
  for (let i = 0; i <= len; i += step) {
    array.push(i)
  }
  return array
}
const hex2float = (num) => {
  const sign = num & 0x80000000 ? -1 : 1
  const exponent = ((num >> 23) & 0xff) - 127
  const mantissa = 1 + (num & 0x7fffff) / 0x7fffff
  return (sign * mantissa * Math.pow(2, exponent)).toFixed(1)
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
  if (command === 2100 || command === 2102) {
    calcuingFlag = true
  } else if (command === 2101 || command === 2103) {
    calcuingFlag = false
    // 这是一个信号，通知主线程可以更新ui了
    DataProcessor.listenFunUpdateFlag(DataProcessor.count)
  }
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

const setTreeAndTools = (wholeDataList) => {
  const resArr = []
  const initShowFlagArr = []
  wholeDataList.forEach((item) => {
    const [circleId, firstNode, secondNode, leafNode, initShowFlag] = item.split(',')
    // wholeDataList.push(item)
    // console.log('item', item)
    if (initShowFlag == 1)
      initShowFlagArr.push({ id: circleId, label: leafNode, firstNode, secondNode })
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
                label: leafNode,
                // label: `${leafNode}-${circleId}`,
                firstNode,
                secondNode
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
              label: leafNode,
              // label: `${leafNode}-${circleId}`,
              firstNode,
              secondNode
            }
          ]
        }
        getFirstNode.children.push(construcSecondObj)
      } else {
        const construcLeafObj = {
          id: circleId,
          label: leafNode,
          // label: `${leafNode}-${circleId}`,
          firstNode,
          secondNode
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
  const {
    code,
    timePoint = 0,
    wholeDataList = [],
    showCircleData = []
  } = JSON.parse(data.toString())
  // console.log('test==>', code, wholeDataList, showCircleData)
  if (code === 2104) {
    setTreeAndTools(wholeDataList)
  } else {
    DataProcessor.pushArr(showCircleData, timePoint)
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
  // console.log('aaa', resArr)
  DataProcessor.listenFunTree(resArr) // 设置初始左侧目录
  DataProcessor.listenFunInitTools(initShowFlagArr) // 设置初始化第一张图表中要显示的曲线的toolBarArr
  DataProcessor.treeList = resArr
}
let cou = 0
const unPackageStreaminWin = (data) => {
  const cirNum = hexToInt(data.slice(4, 8)) // 曲线条数
  const pointNum = hexToInt(data.slice(8, 12)) // 点数
  const timePoint = hex2float(hexToInt(data.slice(16, 20))) // 时间点
  // if (timePoint - cou != 0.5) { // 找出不连续的断点
  //   console.error('timePoint', timePoint)
  // }
  // cou = timePoint

  // timePointArr这个时间点的逻辑可能不需要，待确定
  // const timePointArr = [] as any[]
  // for (let i = 0; i < pointNum; i++) {
  //   const timePoint = hex2float(hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
  //   timePointArr.push(aa)
  // }
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
  // console.log('曲线条数', cirNum, '点数', pointNum, '时间点', timePoint, showCircleData)
  DataProcessor.pushArr(showCircleData, timePoint)
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
let calcuingFlag = false // 是否在计算中
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
    calcuingFlag = true
    runUnpackageDataFunc(data)
  })
  client_sock.on('end', function () {
    // 客户端计算结束
    calcuingFlag = false
    // 这是一个信号，通知主线程可以更新ui了
    DataProcessor.listenFunUpdateFlag(DataProcessor.count)
    console.log('Client disconnected')
  })
  client_sock.on('error', function (_err) {
    // console.log('error', err)
  })
})
socketServer.on('error', function () {
  console.log('listen error')
})
socketServer.on('close', function () {
  console.log('server stop listener')
})
socketServer.on('listening', function () {
  console.log('start listening...', process.platform)
})
socketServer.listen({
  port: 8099,
  host: '127.0.0.1',
  exclusive: true
})

let currentTimePoint = 0
// Comlink.expose(fns)
const DataProcessor = {
  treeList: {},
  myScoket: null,
  count: 0,
  newtoolbarsMap: null,
  wholeCircleDataMap: new Map(),
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
  setNewtoolbarsMap: async (arg) => {
    DataProcessor.newtoolbarsMap = arrayToMap(arg)
    // console.log('newtoolbarsMap', DataProcessor.newtoolbarsMap)
  },
  timeLine: 100000, // 总的计算时间
  pushArr: (originData, timePoint) => {
    currentTimePoint = timePoint
    const len = originData.length
    // console.log('originData', originData)
    for (let i = 0; i < len; i++) {
      const { id, value } = originData[i]
      const getCircleValArr = DataProcessor.wholeCircleDataMap.get(id)
      if (getCircleValArr) {
        getCircleValArr.splice(-1, 0, [timePoint, value])
      } else {
        // 尝试以float64Array的数据结构传给echart,没成功 https://jsfiddle.net/zqu2tn8f/12/
        // const bufArr = new Float64Array(10000)
        // bufArr[0] = value
        // this.wholeCircleDataMap.get(id) = bufArr
        // DataProcessor.wholeCircleDataMap.get(id) = [value]
        // 设置结尾的时间点
        const endTime = DataProcessor.timeLine
        DataProcessor.wholeCircleDataMap.set(id, [
          [timePoint, value],
          [endTime, null]
        ])
      }
    }
    DataProcessor.count++
    // TODO通知主线程更新数据 还有一个条件就是exe程序推流完成(判断最后一组数据的时间点是开始页面输入的时间点)
    // if (DataProcessor.count % 20 === 0) {
      // 这是一个信号，通知主线程可以更新ui了
      DataProcessor.listenFunUpdateFlag(DataProcessor.count)
      // 在DashBoard组件中监听所有的toolbars，有变化时，把变化的最新值发给worker存到变量newtoolbarsMap中,
      // worker在socket收到数据，将数据跟newtoolbarsMap构造出一个大的map结构[wholeOptionsMap]，发给主
      // 线程，在通过每个echarts组件监听对应key的props变化更新视图
      // wholeOptionsMap = {
      //   {
      //     "key": "_67905337911672860809651", // 每个echarts的index
      //     "value": [
      //         {
      //           // 每条线的options配置
      //         },
      //         {
      //           // 每条线的options配置
      //         }
      //     ]
      // }
      // }
    // }
  },
  getCicleDataByToolBars: async (arg, toolBars) => {
    // console.log('getCicl-eDataByToolBars', arg, toolBars)
    return 'getCicleData-ByToolBars'
  },
  getCircleValbyId: async (lineIds, handleLineType = 'add') => {
    if (lineIds.length === 0) {
      const options = {
        // animationDuration: 2000, // 增加线时加上动画
        // animationDuration: 0, // 增加线时加上动画
        // xAxis: {
        //   type: 'category',
        //   // type: 'value',
        //   // boundaryGap: false,
        //   // data: []
        //   data: generatorXaixList(5000, 0.5)
        // },
        series: []
      }
      // 只传输不复制, 这么传没成功
      // const data = new Uint8Array(options)
      // return Comlink.transfer(data, [data.buffer])
      return options
    }
    const seriesVals = lineIds.map((lineItem) => {
      const circleData = DataProcessor.wholeCircleDataMap.get(lineItem.index)
      return {
        name: lineItem.name,
        type: 'line',
        lineStyle: {
          color: lineItem.color
        },
        itemStyle: {
          color: lineItem.color
        },
        // dimensions: {
        //   type: 'float'
        // },
        // encode: {
        //   x: 'date',
        //   y: 'value'
        // },
        animation: false,
        smooth: true,
        symbol: 'none',
        lazyLoad: true, // 官方文档没找到这个配置
        sampling: 'lttb', //降采样策略
        data: circleData,
        large: true,
        useFloat64Array: true
      }
    })
    if (handleLineType === 'add') {
      const options = {
        // animationDuration: 400, // 增加线时加上动画
        // animationDuration: 0, // 增加线时加上动画
        // xAxis: {
        //   type: 'category',
        //   // type: 'value',
        //   // boundaryGap: false,
        //   // data: []
        //   data: generatorXaixList(5000, 0.5)
        // },
        series: seriesVals
      }
      // console.log('calcuingFlag', calcuingFlag, currentTimePoint)
      let dataZoom = [
        {
          type: 'inside',
          show: true,
          moveOnMouseMove: true,
          filterMode: 'empty',
          startValue: currentTimePoint - 100,
          endValue: currentTimePoint + 20,
          zoomOnMouseWheel: false
        }
      ]
      if (!calcuingFlag) {
        dataZoom = [
          {
            type: 'inside',
            show: true,
            moveOnMouseMove: true,
            filterMode: 'empty',
            startValue: currentTimePoint - 100,
            endValue: currentTimePoint,
            zoomOnMouseWheel: false
          },
          {
            type: 'slider',
            filterMode: 'filter',
            startValue: currentTimePoint - 100,
            endValue: currentTimePoint
          }
        ]
      }
      options.dataZoom = dataZoom
      // console.log('options--', options)
      // 转成buffer, 只传输不复制
      const optionsBuff = DataProcessor.objectToBuffer(options)
      return Comlink.transfer(optionsBuff, [optionsBuff])
      // return options
    } else {
      const options = {
        // animationDuration: 0, // 设置成0时，删除图中某条折线时，视图更新出现刷新的动画
        series: seriesVals
      }
      const optionsBuff = DataProcessor.objectToBuffer(options)
      return Comlink.transfer(optionsBuff, [optionsBuff])
      // return options
    }
  },
  objectToBuffer: (obj) => {
    // 将对象转换为字符串
    const objectString = JSON.stringify(obj)
    // 将字符串转换为 ArrayBuffer
    return new TextEncoder().encode(objectString).buffer
  },
  getArr: () => {
    console.log('getA-rr--->', DataProcessor.count, DataProcessor.wholeCircleDataMap)
  },
  toUpperCase: (msg) => {
    return msg.toUpperCase()
  },
  doHardWork: () => {
    // let i = 0
    // while (i < 9000000000) {
    //   i++
    // }
    // return i
  }
}

Comlink.expose(DataProcessor)

// self.addEventListener('message', (e) => {
//   console.log('worker got', e)

//   self.postMessage(e.data.toUpperCase())
// })
