const net = require('net')
const { Buffer } = require('buffer')

const FillString = (t, c, n, b) => {
  if (t == '' || c.length != 1 || n <= t.length) {
    return t
  }
  let l = t.length
  for (let i = 0; i < n - l; i++) {
    if (b == true) {
      t = c + t
    } else {
      t += c
    }
  }
  return t
}
const HexToDouble = (ca2) => {
  // 8字节16进制转双精度浮点数
  let t = parseInt(ca2, 16).toString(2)
  if (t.length < 64) {
    t = FillString(t, '0', 64, true)
  }
  let s = t.substring(0, 1)
  let e = t.substring(1, 12)
  let m = t.substring(12)
  e = parseInt(e, 2) - 1023
  m = '1' + m
  if (e >= 0) {
    m = m.substring(0, e + 1) + '.' + m.substring(e + 1)
  } else {
    m = '0.' + FillString(m, '0', m.length - e - 1, true)
  }
  if (m.indexOf('.') == -1) {
    m = m + '.0'
  }
  let a = m.split('.')
  let mi = parseInt(a[0], 2)
  let mf = 0
  for (let i = 0; i < a[1].length; i++) {
    mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1))
  }
  m = parseInt(mi) + parseFloat(mf)
  if (s == 1) {
    m = 0 - m
  }
  return m
}

const hexToSingle = (num) => {
  // 4字节16进制转单精度浮点数
  const a = num
  const b = parseInt(a, 16)
  const s = b & 0x80000000 ? -1 : 1
  const e = (b & 0x7f800000) / 0x800000 - 127
  const c = (b & 0x7fffff) / 0x800000
  const re = s * (1 + c) * Math.pow(2, e)
  return re
}

const hexToInt = (hexBuf) => {
  // 十六进制 转 十进制 Number('0x' + '000e')
  return Number('0x' + hexBuf.toString('hex'))
}

/**
 *  创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
    client_sock,就是我们的与客户端通讯建立连接配对的socket
    client_sock 就是与客户端通讯的net.Socket
 *  00 0E 04 57 00 00 00 02 41 31 C2 8F 41 31 C2 8F // 解析float,int 
    00 0E: 14 消息体长度  转 int
    04 57： 1111 code 转 int -> 不同的code对应使用不同的转换方法处理消息体中的数据，转成int，float, 中英文字符串 等
    00 00 00 02: size 2 转 int  两个4字节的16进制转单精度浮点数， 在buffer中截取（2 x 4 = 8 位）
    41 31 C2 8F 41 31 C2 8F： 数据 11.11 转 float

    
    00 20 / 04 57 / 00 00 00 03 / 00 06    / 41 41 41 42 42 42 / 00 08 / 41 41 41 41 42 42 42 42 /  00 06 / D6 D0 B9 FA C8 CB
                                                                                                          / 中国人
    00 29 / 04 57 / 00 00 00 03 / 00 06    / 41 41 41 42 42 42 / 00 08 / 41 41 41 41 42 42 42 42 /  00 0f / E4 BD A0 E5 A5 BD E5 AE A2 E6 88 B7 E7 AB AF   // 解析 string
    41    /code   / size       /字符串长度  / AAABBB            /       / AAAABBBB                         / 你好客户端
    00 29 04 57 00 00 00 03 00 06 41 41 41 42 42 42 00 08 41 41 41 41 42 42 42 42 00 0f E4 BD A0 E5 A5 BD E5 AE A2 E6 88 B7 E7 AB AF
   @构造可以使用的数据格式
   [
      {
         title: 'AAABBB'
         id： index
      }
      {
         title: 'AAAABBBB'
         id： index
      }
   ]
   @中国人 TODO 每个汉字分别占用2和3个字节的buffer, 通过data.tostring(),默认可以解析3个字节的汉字,没解析出来占用2个字节的汉字
   'D6 D0 B9 FA C8 CB' => '中国人'
   'E4 B8 AD E5 9B BD E4 BA BA' => '中国人'
*/

const unPackString = (data, res3) => {
  const size = hexToInt(res3)
  let ind = 8
  for (let i = 0; i < size; i++) {
    const stringLen = hexToInt(data.slice(ind, ind + 2))
    console.log('stringLen', size, stringLen)
    ind += 2
    const str = data.slice(ind, ind + stringLen).toString()
    console.log(111, str, new Date())
    ind += stringLen
  }
}
const unPackIntFloat = (data, res3) => {
  for (let i = 0; i < hexToInt(res3); i++) {
    const str = data.slice(8 + 4 * i, 8 + 4 * i + 4)
    console.log('str', hexToSingle(str.toString('hex')), new Date())
  }
}

const packBuffer = (data, id) => {
  const header = {
    len: data.length,
    id
  }
  const buf1 = Buffer.from(JSON.stringify(header))
  const buf2 = Buffer.from(data)
  const buf3 = Buffer.concat([buf1, buf2])
  console.log('packbuffer', buf1, buf2, buf3)
  return buf3
}

const createSocketServer = net.createServer(function (client_sock) {
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
    const packBufferRet = packBuffer([{ name: 'bingo' }], 1992)
    console.log('packBufferRet', packBufferRet)
    client_sock.write(packBufferRet)
    //   client_sock.write('中国人')
    // client_sock.write(Buffer.from('00 29', 'hex'))
    //  @中国人 TODO 每个汉字分别占用2和3个字节的buffer, 通过data.tostring(),默认可以解析3个字节的汉字,没解析出来占用2个字节的汉字
    // 'D6 D0 B9 FA C8 CB' => '中国人'
    // 'E4 B8 AD E5 9B BD E4 BA BA' => '中国人'
    console.log(1111, data, data.toString('utf8')) //hex
    const res1 = data.slice(0, 2)
    const res2 = data.slice(2, 4)
    const res3 = data.slice(4, 8)
    // const res4 = data.slice(8, 16)
    //  unPackString(data, res3)
    // unPackIntFloat(data, res3)

    //utf8
    // recvbuf = new Buffer(data, (encoding = 'binary'))
    // recvbuf = Buffer.from(data, 'binary')
    // const tempStr = recvbuf.toString('ascii')
    // console.log('recv:' + recvbuf.length)
    // console.log(recvbuf.toString('ascii'))

    // client_sock.write('goodbye!!!')

    // client_sock.end() // 正常关闭
  })

  client_sock.on('error', function (err) {
    console.log('error', err)
  })
})

// 当我开始监听的时候就会调用这个回掉函数
createSocketServer.on('listening', function () {
  console.log('start listening...')
})

// 监听发生错误的时候调用
createSocketServer.on('error', function () {
  console.log('listen error')
})

createSocketServer.on('close', function () {
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
createSocketServer.listen({
  port: 6080,
  host: '127.0.0.1',
  exclusive: true
})
