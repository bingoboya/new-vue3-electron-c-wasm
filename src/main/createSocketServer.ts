import { ipcMain } from 'electron'
import Utils from './utils'
const iconv = require('iconv-lite')
const net = require('net')

/**
 *  创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
    client_sock,就是我们的与客户端通讯建立连接配对的socket
    client_sock 就是与客户端通讯的net.Socket
 *  00 0E 04 57 00 00 00 02 41 31 C2 8F 41 31 C2 8F
    00 0E: 14 消息体长度  转 int
    04 57： 1111 code 转 int -> 不同的code对应使用不同的转换方法处理消息体中的数据，转成int，float, 中英文字符串 等
    00 00 00 02: 长度 2 转 int  两个4字节的16进制转单精度浮点数， 在buffer中截取（2 x 4 = 8 位）
    41 31 C2 8F 41 31 C2 8F： 数据 11.11 转 float
*/
//                                                                            2000;                1;                 cirid;
// 选择曲线     case: 2000: '消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '选择的曲线id int'
// 取消选择曲线 case: 2001: '消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '取消的曲线id int'
// 直接开始计算 case: 2100: '消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// 暂停计算     case: 2101: '消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// 继续计算     case: 2102: '消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// 退出计算     case: 2103: '消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';

let myScoket = null as any
// 选择曲线 case:2000 和 取消选择曲线 case:2001
//TODO const handleCircleExeFunc = (caseType = 2000, circleId = 1002) => {
//   if (myScoket === null) return
//   //设置消息内容: 消息体长度的buffer + caseType的buffer + 点数的buffer + 选择的曲线id的buffer
//   const codeTypeBuf = Buffer.from(Utils.IntToBytesBigEndian(caseType, 2)) // caseType的buffer
//   const pointNumBuf = Buffer.from(Utils.IntToBytesBigEndian(1, 4)) // 点数的buffer，默认是 1
//   const ciridBuf = Buffer.from(Utils.IntToBytesBigEndian(circleId, 4)) // 选择的曲线id的buffer
//   const contentBuf = Buffer.concat([codeTypeBuf, pointNumBuf, ciridBuf]) // 拼接的消息体的buffer
//   const contentLenBuf = Buffer.from(Utils.IntToBytesBigEndian(contentBuf.length, 2)) // 消息体buffer的长度的buffer
//   const msg = Buffer.concat([contentLenBuf, contentBuf]) // 消息体长度的buffer拼接消息体的buffer
//   //发送数据
//   myScoket.write(msg, () => {
//     console.log('数据发送成功：', msg)
//   })
// }
// 直接开始计算 case:2100 && 暂停计算 case:2101 && 继续计算 case:2102 && 退出计算 case:2103
const handleExeFunc = (caseType = 2103) => {
  console.log('handleExeFunc===1111', caseType)
  if (myScoket === null) return
  console.log('handleExeFunc===', caseType)
  //设置消息内容: 消息体长度的buffer + caseType的buffer + 点数的buffer
  const codeTypeBuf = Buffer.from(Utils.IntToBytesBigEndian(caseType, 2)) // caseType的buffer
  const pointNumBuf = Buffer.from(Utils.IntToBytesBigEndian(1, 4)) // 点数的buffer，默认是 1
  const contentBuf = Buffer.concat([codeTypeBuf, pointNumBuf]) // 拼接的消息体的buffer
  const contentLenBuf = Buffer.from(Utils.IntToBytesBigEndian(contentBuf.length, 2)) // 消息体buffer的长度的buffer
  const msg = Buffer.concat([contentLenBuf, contentBuf]) // 消息体长度的buffer拼接消息体的buffer
  // <Buffer 39 32 31 30 32 31 31 30 30 32>
  //发送数据
  myScoket.write(msg, () => {
    console.log('数据发送成功：', msg)
  })
}
ipcMain.on('sendSocket', (_event, arg) => {
  if (process.platform === 'darwin') {
    myScoket.write(arg + '', () => {
      console.log('数据发送成功：', arg)
    })
  } else {
    handleExeFunc(arg)
  }
})
const pushDataInMac = (showCircleData, mainWindow) => {
  mainWindow?.webContents.send(
    'socket-wholecircle-data-list-inmac',
    showCircleData
    // {
    //   count,
    //   showCircleData,
    //   initShowFlagArr
    // }
  )
}
const pushWholeData = (wholeDataList, mainWindow) => {
  const resArr = [] as any[]
  const initShowFlagArr = [] as any[]
  wholeDataList.forEach((item) => {
    console.log('buf-gbkkkk--->', item)
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
      const getSecondNode = getFirstNode.children.find(
        (secondItem) => secondItem.id === secondNode
      )
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
  console.log(3333333333333333)
  mainWindow?.webContents.send('socket-tree-data-list', {
    context: resArr,
    initShowFlagArr
  })
}
const createSocketServer = (listenConf, mainWindow) => {
  const socketServer = net.createServer((client_sock) => {
    myScoket = client_sock
    console.log('client comming', client_sock.remoteAddress)
    // 设置你接受的格式,
    // client_sock.setEncoding("utf8");
    // client_sock.setEncoding("hex"); // 转成二进制的文本编码
    const resArr = [] as any
    const initShowFlagArr = [] as any
    const wholeDataList = [] as any
    client_sock.on('data', function (data) {
      // console.log('data', data.toString())
      if (process.platform === 'darwin') {
        const { code, wholeDataList = [], showCircleData = [] } = JSON.parse(data.toString())
        // console.log(code, wholeDataList, showCircleData, initShowFlagArr)
        console.log(code)
        if (code === 2104) {
          pushWholeData(wholeDataList, mainWindow)
        } else {
          pushDataInMac(showCircleData, mainWindow)
        }
        return
      }
      // handleExeFunc()
      const codeType = Utils.hexToInt(data.slice(2, 4))
      if (codeType === 1000) {
        console.log('codeType==>', codeType)
        // 处理string
        const cirNum = Utils.hexToInt(data.slice(4, 8))
        let index = 8
        for (let i = 0; i < cirNum; i++) {
          const short = Utils.hexToInt(data.slice(index, index + 2))
          index += 2
          const item = iconv.decode(data.slice(index, index + short), 'gbk')
          console.log('buf-gbkkkk--->', item)
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
            const getSecondNode = getFirstNode.children.find(
              (secondItem) => secondItem.id === secondNode
            )
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
        mainWindow?.webContents.send('socket-tree-data-list', {
          context: resArr,
          initShowFlagArr
        })
      } else if (codeType === 1001) {
        // mainWindow?.webContents.send('socket-wholecircle-data-inwindows', data)
        // return
        const cirNum = Utils.hexToInt(data.slice(4, 8)) // 曲线条数
        const pointNum = Utils.hexToInt(data.slice(8, 12)) // 点数
        const timePoint = Utils.hex2float(Utils.hexToInt(data.slice(16, 20))).toFixed(1) // 时间点
        console.log('codeType=>', codeType, '曲线条数', cirNum, '点数', pointNum, '时间点', timePoint)
        // timePointArr这个时间点的逻辑可能不需要，待确定
        // const timePointArr = [] as any[]
        // for (let i = 0; i < pointNum; i++) {
        //   const timePoint = Utils.hex2float(Utils.hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
        //   timePointArr.push(aa)
        // }
        // console.log(3333333, timePointArr)
        let cirId = null as any // 曲线编号
        let index = 16 + 4 * pointNum
        const showCircleData = [] as any[]
        for (let i = 0; i < cirNum - 1; i++) {
          cirId = Utils.hexToInt(data.slice(index, index + 4))
          index += 4
          for (let j = 0; j < pointNum; j++) {
            const cirVal = Utils.hex2float(Utils.hexToInt(data.slice(index, index + 4)))
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
        mainWindow?.webContents.send('socket-wholecircle-data-list-inmac', showCircleData)
        // mainWindow?.webContents.send('socket-wholecircle-data-inwindows', data)
      }
      // client_sock.end() // 正常关闭
    })
    client_sock.on('error', function (_err) {
      // console.log('error', err)
    })
  })

  socketServer.on('listening', function () {
    console.log('start listening...')
  })

  socketServer.on('error', function () {
    console.log('listen error')
  })

  socketServer.on('close', function () {
    console.log('server stop listener')
  })
  /*
  createSocketServer.on("connection", function(client_sock) {
    console.log("client comming 22222");
  });
  */
  // 编写代码，指示这个server监听到哪个端口上面。
  // 127.0.0.1: 6080
  // node就会来监听我们的server,等待连接接入
  socketServer.listen(listenConf)
}

export default {
  createSocketServer,
  handleExeFunc
}
