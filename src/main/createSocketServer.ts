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
// case: 2000 ==> 00 0E: '14 消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '选择的曲线id int'
// case: 2001 ==> 00 0E: '14 消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '取消的曲线id int'
// case: 2100 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2101 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2102 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2103 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';

const createSocketServer = (listenConf, mainWindow) => {
  const socketServer = net.createServer((client_sock) => {
    console.log('client comming', client_sock.remoteAddress, client_sock.remotePort)
    // 设置你接受的格式,
    // client_sock.setEncoding("utf8");
    // client_sock.setEncoding("hex"); // 转成二进制的文本编码
    //
    // 接收到客户端的数据，调用这个函数
    // data 默认是Buffer对象，如果你强制设置为utf8,那么底层会先转换成utf8的字符串，传给你
    // hex 底层会把这个Buffer对象转成二进制字符串传给你
    // 如果你没有设置任何编码 <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64 21>
    // utf8 --> HelloWorld!!!   hex--> "48656c6c6f576f726c6421"
    const resArr = []
    const initShowFlagArr =  []
    const wholeDataList = []
    client_sock.on('data', function (data) {
      client_sock.write('2000')
      client_sock.emit()
      // const res3 = data.slice(4, 8)
      // const res4 = data.slice(8, 8 + Utils.hexToInt(res3) * 4)
      // const context = Utils.hexToSingle(res4.toString('hex'))
      const codeType = Utils.hexToInt(data.slice(2, 4))
      console.log('codeType==>', codeType)
      if (codeType === 1000) {
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
        const cirNum = Utils.hexToInt(data.slice(4, 8)) // 曲线条数
        const pointNum = Utils.hexToInt(data.slice(8, 12)) // 点数
        const time = Utils.hexToInt(data.slice(12, 16)) // 时间
        console.log(cirNum, pointNum, time) // 时间点
        const arr = []
        for (let i = 0; i < pointNum; i++) {
          const aa = Utils.hex2float(Utils.hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
          // console.log('arrrr---', aa)
          arr.push(aa)
        }
        let cirId = null // 曲线编号
        let index = 16 + 4 * pointNum
        const showCircleData = []
        for (let i = 0; i < cirNum - 1; i++) {
          cirId = Utils.hexToInt(data.slice(index, index + 4))
          index += 4
          for (let j = 0; j < pointNum; j++) {
            const cirVal = Utils.hex2float(Utils.hexToInt(data.slice(index, index + 4)))
            index += 4

            const hasCirId = initShowFlagArr.findIndex((initItem) => initItem.id == cirId)
            if (hasCirId !== -1) {
              showCircleData.push({
                id: cirId,
                value: cirVal
              })
            }
            console.log('cirVal', cirVal, cirId)
            // console.log('cirVal2', hasCirId, initShowFlagArr)
          }
        }
        console.log(3333333, arr)
        mainWindow?.webContents.send('socket-whole-circle-data-list', {
          showCircleData,
          initShowFlagArr
        })
      }

      // client_sock.write('goodbye!!!')ss

      // client_sock.end() // 正常关闭
    })

    client_sock.on('error', function (err) {
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

export default createSocketServer
