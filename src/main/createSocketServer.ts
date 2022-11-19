import Utils from './utils'

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
    client_sock.on('data', function (data) {
      // console.log(data, data.toString()) //hex
      client_sock.write('你好客户端！')
      // const res1 = data.slice(0, 2)
      // const res2 = data.slice(2, 4)
      const res3 = data.slice(4, 8)
      // const res4 = data.slice(8, 16)
      const res4 = data.slice(8, 8 + Utils.hexToInt(res3) * 4)
      const context = Utils.hexToSingle(res4.toString('hex'))
      // console.log(
      //   'readint------',
      //   // hexToInt(res1),
      //   // hexToInt(res2),
      //   // hexToInt(res3),
      //   // context,
      //   Number(context.toFixed(2)),
      //   new Date()
      // )

      mainWindow?.webContents.send('sendclientSocketmsg-from-main-process-to-APP.vue', {
        context,
        data2string: data.toString()
      })
      //utf8
      // recvbuf = new Buffer(data, (encoding = 'binary'))
      // recvbuf = Buffer.from(data, 'binary')
      // const tempStr = recvbuf.toString('ascii')
      // console.log('recv:' + recvbuf.length)
      // console.log(recvbuf.toString('ascii'))

      // client_sock.write('goodbye!!!')ss

      // client_sock.end() // 正常关闭
    })

    client_sock.on('error', function (err) {
      console.log('error', err)
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
