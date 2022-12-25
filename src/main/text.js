const net = require('net')
const { Buffer } = require('buffer')
const iconv = require('iconv-lite')

/**
 *  创建一个net.Server用来监听,当连接进来的时候，就会调用我们的函数
    client_sock,就是我们的与客户端通讯建立连接配对的socket
    client_sock 就是与客户端通讯的net.Socket
 *  00 0E 04 57 00 00 00 02 41 31 C2 8F 41 31 C2 8F // 解析float,int 
    00 0E: 14 消息体长度  转 int
    04 57： 1111 code 转 int -> 不同的code对应使用不同的转换方法处理消息体中的数据，转成int，float, 中英文字符串 等  1001, 1000
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
const hex2float = (num) => {
  var sign = num & 0x80000000 ? -1 : 1
  var exponent = ((num >> 23) & 0xff) - 127
  var mantissa = 1 + (num & 0x7fffff) / 0x7fffff
  return sign * mantissa * Math.pow(2, exponent)
}
const hexToInt = (hexBuf) => {
  // 十六进制 转 十进制 Number('0x' + '000e')
  const a = Number('0x' + hexBuf.toString('hex'))
  return a
}
function intToByte(i) {
  var b = i & 0xff
  var c = 0
  if (b >= 128) {
    c = b % 128
    c = -1 * (128 - c)
  } else {
    c = b
  }
  console.log(c)
  return c
}
function IntToBytesLittleEndian(number, length) {
  var bytes = []
  var i = 0
  do {
    bytes[i++] = number & 255
    number = number >> 8
  } while (i < length)
  return bytes
}

function IntToBytesBigEndian(number, length){
  var bytes = [];
  var i = length;
  do {
  bytes[--i] = number & (255);
  number = number>>8;
  } while (i)
  return bytes;
}



const a1 = IntToBytesLittleEndian(2102, 2)
console.log('1', a1, IntToBytesBigEndian(1, 4))

//  00 0A      08 36    00 00 00 01     00 00 03 EA 
// 总长度10     2102      1               1002

//                                                                            2000;                1;                 cirid;
// case: 2000 ==> 00 0E: '14 消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '选择的曲线id int'
// case: 2001 ==> 00 0E: '14 消息体长度(code + 点数 + 曲线id)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int'; '取消的曲线id int'
// case: 2100 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2101 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2102 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
// case: 2103 ==> 00 0E: '14 消息体长度(code + 点数)  转 int' ; '04 57： 1111 code'; '点数： 目前默认 1 int';
let myScoket = null
const createSocketServer = net.createServer(function (client_sock) {
  myScoket = client_sock
  console.log('client comming1', client_sock.remoteAddress, client_sock.remotePort)
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
    console.log('data====', data)
    // const packBufferRet = packBuffer([{ name: 'bingo' }], 1992)
    // console.log('packBufferRet', packBufferRet)
    // client_sock.write(packBufferRet)
    // client_sock.write('中国人')
    //设置消息内容
    const codeTypeBuf = Buffer.from(IntToBytesBigEndian(2102, 2))
    
    const pointNumBuf = Buffer.from(IntToBytesBigEndian(1, 4))
    const ciridBuf = Buffer.from(IntToBytesBigEndian(1002, 4))
    const b = Buffer.concat([codeTypeBuf, ciridBuf])
    const v = Buffer.from(IntToBytesBigEndian(b.length, 2))
    const msg = Buffer.concat([v, b])
    console.log(333333, codeTypeBuf, pointNumBuf, ciridBuf)
    // <Buffer 39 32 31 30 32 31 31 30 30 32>
    //发送数据
    client_sock.write(msg, function () {
      const writeSize = client_sock.bytesWritten
      console.log('数据发送成功，数据长度为：' + writeSize)
    })

    // client_sock.write(Buffer.from('00 29', 'hex'))
    //  @中国人 TODO 每个汉字分别占用2和3个字节的buffer, 通过data.tostring(),默认可以解析3个字节的汉字,没解析出来占用2个字节的汉字
    // 'D6 D0 B9 FA C8 CB' => '中国人'
    // 'E4 B8 AD E5 9B BD E4 BA BA' => '中国人'
    const codeType = hexToInt(data.slice(2, 4))
    console.log(codeType)
    if (codeType === 1001) {
      // 曲线条数
      const cirNum = hexToInt(data.slice(4, 8))
      // 点数
      const pointNum = hexToInt(data.slice(8, 12))
      // 时间
      const time = hexToInt(data.slice(12, 16))
      // 时间点
      console.log(cirNum, pointNum, time)
      const arr = []
      for (let i = 0; i < pointNum; i++) {
        const aa = hex2float(hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
        // console.log('arrrr---', aa)
        arr.push(aa)
      }

      let cir = '' // 曲线编号
      let index = 16 + 4 * pointNum
      for (let i = 0; i < cirNum - 1; i++) {
        cir = hexToInt(data.slice(index, index + 4))
        // console.log('cir', cir)
        index += 4
        for (let j = 0; j < pointNum; j++) {
          // console.log('aaaaaa', data.slice(index, index + 4), hexToSingle(data.slice(index, index + 4)))
          const aa = hex2float(hexToInt(data.slice(index, index + 4)))
          index += 4
          console.log('aa', aa, cir)
        }
      }
      console.log(3333333, arr)
    } else if (codeType === 1000) {
      // 处理string
      const cirNum = hexToInt(data.slice(4, 8))
      let index = 8
      const resArr = []
      for (let i = 0; i < cirNum; i++) {
        const short = hexToInt(data.slice(index, index + 2))
        index += 2
        const item = iconv.decode(data.slice(index, index + short), 'gbk')
        console.log('buf-gbkkkk--->', item)
        const [circleId, firstNode, secondNode, leafNode, showFlag] = item.split(',')
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
      console.log('resArr', resArr)
    }

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
    // console.log('error', err)
  })
})
// setTimeout(() => {
//   //设置消息内容
//   const message = 'fuck'
//   //发送数据
//   myScoket.write(message, function () {
//     const writeSize = myScoket.bytesWritten
//     console.log('数据发送成功，数据长度为：' + writeSize)
//   })
// }, 6000);

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
  port: 8099,
  host: '127.0.0.1',
  exclusive: true
})
