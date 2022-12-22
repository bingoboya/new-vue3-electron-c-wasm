const net = require('net')
const { Buffer } = require('buffer')
const { StringDecoder } = require('string_decoder')
const iconv = require('iconv-lite');

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

const hexToInt = (hexBuf) => {
  // 十六进制 转 十进制 Number('0x' + '000e')
  const a = Number('0x' + hexBuf.toString('hex'))
  return a
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

const utf16ToUtf8 = (utf16Str) => {
  var utf8Arr = []
  var byteSize = 0
  for (var i = 0; i < utf16Str.length; i++) {
    //获取字符Unicode码值
    var code = utf16Str.charCodeAt(i)

    //如果码值是1个字节的范围，则直接写入
    if (code >= 0x00 && code <= 0x7f) {
      byteSize += 1
      utf8Arr.push(code)

      //如果码值是2个字节以上的范围，则按规则进行填充补码转换
    } else if (code >= 0x80 && code <= 0x7ff) {
      byteSize += 2
      utf8Arr.push(192 | (31 & (code >> 6)))
      utf8Arr.push(128 | (63 & code))
    } else if ((code >= 0x800 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xffff)) {
      byteSize += 3
      utf8Arr.push(224 | (15 & (code >> 12)))
      utf8Arr.push(128 | (63 & (code >> 6)))
      utf8Arr.push(128 | (63 & code))
    } else if (code >= 0x10000 && code <= 0x10ffff) {
      byteSize += 4
      utf8Arr.push(240 | (7 & (code >> 18)))
      utf8Arr.push(128 | (63 & (code >> 12)))
      utf8Arr.push(128 | (63 & (code >> 6)))
      utf8Arr.push(128 | (63 & code))
    }
  }

  return utf8Arr
}
const utf8ToUtf16 = (utf8Arr) => {
  var utf16Str = ''
  for (var i = 0; i < utf8Arr.length; i++) {
    //每个字节都转换为2进制字符串进行判断https://blog.csdn.net/qq_40011214/article/details/121281242
    var one = utf8Arr[i].toString(2)
    //正则表达式判断该字节是否符合>=2个1和1个0的情况
    var v = one.match(/^1+?(?=0)/)
    //多个字节编码
    if (v && one.length == 8) {
      //获取该编码是多少个字节长度
      var bytesLength = v[0].length
      //首个字节中的数据,因为首字节有效数据长度为8位减去1个0位，再减去bytesLength位的剩余位数
      var store = utf8Arr[i].toString(2).slice(7 - bytesLength)
      for (var st = 1; st < bytesLength; st++) {
        //后面剩余字节中的数据，因为后面字节都是10xxxxxxx，所以slice中的2指的是去除10
        store += utf8Arr[st + i].toString(2).slice(2)
      }
      //转换为Unicode码值
      utf16Str += String.fromCharCode(parseInt(store, 2))
      //调整剩余字节数
      i += bytesLength - 1
    } else {
      //单个字节编码，和Unicode码值一致，直接将该字节转换为UTF-16
      utf16Str += String.fromCharCode(utf8Arr[i])
    }
  }

  return utf16Str
}

// const ssss = (() => {
//   // 创建一个字节序列，其中包含两个汉字（每个汉字占两个字节）
//   const buf = Buffer.from([0xe4, 0xb8, 0xad, 0xe6, 0x96, 0x87])
//   // const testbuf = Buffer.from([0x00, 0x21, 0x31, 0x30, 0x30, 0x30, 0x2c, 0xbd, da, b5, e3, 2c, 42, 55, 53])
//   // 00 21 31 30 30 30 2c bd da b5 e3 2c 42 55 53 31 30 30 30 2c b5 e7 d1 b9 b7 f9 d6 b5 28 6b 56
//   // console.log(44444444, testbuf.toString())
//   // 创建一个 StringDecoder 实例，用于将字节序列转换为字符串
//   const decoder = new StringDecoder('utf16le');

//   // 使用 decoder.write() 方法将字节序列转换为字符串
//   const str = decoder.write(buf);

//   console.log(11111, str);  // 输出: 中文

//   const buf123 = Buffer.from([0xc4, 0xe3])
//   const str123 = buf123.toString('utf8');
//   const buf1234 = Buffer.from('你')
//   console.log(123, str123, buf1234)

//   const buffer = Buffer.from([0xe4, 0xb8])
//   // const buffer1 = Buffer.from([0xe4, 0xb8])
//   const buf1 = Buffer.from('个单', 'utf16le')
//   const s = buf1.toString('utf16le')
//   const s1 = buffer.toString()
//   console.log(3333333, buffer, s, buf1, s1)
// })()
const revertUTF8 = (szInput) => {
  var x,
    wch,
    wch1,
    wch2,
    uch = '',
    szRet = ''
  for (x = 0; x < szInput.length; x++) {
    if (szInput.toString().charAt(x) == '%') {
      wch = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
      if (!wch) {
        break
      }
      if (!(wch & 0x80)) {
        wch = wch
      } else if (!(wch & 0x20)) {
        x++
        wch1 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
        wch = (wch & 0x1f) << 6
        wch1 = wch1 & 0x3f
        wch = wch + wch1
      } else {
        x++
        wch1 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
        x++
        wch2 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
        wch = (wch & 0x0f) << 12
        wch1 = (wch1 & 0x3f) << 6
        wch2 = wch2 & 0x3f
        wch = wch + wch1 + wch2
      }
      szRet += String.fromCharCode(wch)
    } else {
      szRet += szInput.toString().charAt(x)
    }
  }
  return szRet
}
const createSocketServer = net.createServer(function (client_sock) {
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
    //   client_sock.write('中国人')
    // client_sock.write(Buffer.from('00 29', 'hex'))
    //  @中国人 TODO 每个汉字分别占用2和3个字节的buffer, 通过data.tostring(),默认可以解析3个字节的汉字,没解析出来占用2个字节的汉字
    // 'D6 D0 B9 FA C8 CB' => '中国人'
    // 'E4 B8 AD E5 9B BD E4 BA BA' => '中国人'
    // console.log(1111, data, data.toString('utf8')) //hex
    // const res1 = data.slice(0, 2)
    // const res3 = data.slice(4, 8)
    // const res4 = data.slice(8, 10)

    // const res4 = data.slice(8, 16)
    const codeType = hexToInt(data.slice(2, 4))
    // const length = hexToInt(res3)
    // const strLength = hexToInt(res4)
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
        console.log('buffer------', data.slice(16 + 4 * i, 20 + 4 * i))
        const aa = hex2float(hexToInt(data.slice(16 + 4 * i, 20 + 4 * i)))
        console.log('arrrr---', aa)
        arr.push(aa)
      }

      // [
      //   aa: {
      //     1000: 3.108920706381882,
      //     1001: 0.0010016849294450796,
      //   }
      // ]

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
      for (let i = 0; i < cirNum; i++) {
        const short = hexToInt(data.slice(index, index + 2))
        index += 2
        console.log('buf-gbkkkk--->', iconv.decode(data.slice(index, index + short), 'gbk'))
        index += short
      }
    }

    // !1000,洪波,BUS101
    // !1001,洪波,BUS102
    // !1002,洪波,BUS103
    // !1003,洪波,BUS104
    // !1004,大侠,BUS105
    // !1005,大侠,BUS100   !1006,��������,BUS100!1007,��������,BUS100!1008,��������,BUS100!1009,��������,BUS100!1010,��������,BUS100!1011,��������,BUS100!1012,��������,BUS100!1013,��������,BUS100!1014,��������,BUS100!1015,��������,BUS100!1016,��������,BUS100!1017,��������,BUS100!1018,��������,BUS100!1019,��������,BUS100#1020,������������,GEN10%1021,������������,GEN100#1022,������������,GEN10%1023,������������,GEN100#1024,������������,GEN10%1025,������������,GEN100#1026,������������,GEN10%1027,������������,GEN100#1028,������������,GEN10%1029,������������,GEN100#1030,������������,GEN10%1031,������������,GEN100#1032,������������,GEN10%1033,������������,GEN100#1034,������������,GEN10%1035,������������,GEN100#1036,������������,GEN10%1037,������������,GEN100#1038,������������,GEN10%1039,������������,GEN100#1040,������������,BUS10#1041,������������,BUS10#1042,������������,BUS10#1043,������������,BUS10#1044,������������,BUS10#1045,������������,BUS10#1046,������������,BUS10#1047,������������,BUS10#1048,������������,BUS10#1049,������������,BUS10#1050,������������,BUS10#1051,������������,BUS10#1052,������������,BUS10#1053,������������,BUS10#1054,������������,BUS10#1055,������������,BUS10#1056,������������,BUS10#1057,������������,BUS10#1058,������������,BUS10#1059,������������,BUS1

    // unPackIntFloat(data, res2)
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
    // console.log('error', err)
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
  port: 8099,
  host: '127.0.0.1',
  exclusive: true
})
