// const { Buffer } = require('buffer')

// const HEADERLEN = 16
// const id = 1
// export const Pack = (data, id) => {
//   let header = {
//     len: data.length,
//     id
//   }
//   const buf1 = Buffer.from(JSON.stringify(header))
//   const buf2 = Buffer.from(data)
//   const buf3 = Buffer.concat([buf1, buf2])
//   return buf3
// }
// export const Unpack = (binnaryData) => {
//   let data = {}
//   console.log('binnaryData', binnaryData)
//   let header = JSON.parse(binnaryData.slice(0, HEADERLEN))

//   //   if (header.len > 0) {
//   //     let dataStr = binnaryData.slice(HEADERLEN, HEADERLEN + header.len).toString()
//   //     data.dataStr = dataStr
//   //     data.id = header.id
//   //   }
//   return data
// }

const FillString = (t, c, n, b) => {
  if (t == '' || c.length != 1 || n <= t.length) {
    return t
  }
  const l = t.length
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
  const s = Number(t.substring(0, 1))
  let e = Number(t.substring(1, 12))
  let m = t.substring(12)
  e = parseInt(e.toString(), 2) - 1023
  m = '1' + m
  if (e >= 0) {
    m = m.substring(0, e + 1) + '.' + m.substring(e + 1)
  } else {
    m = '0.' + FillString(m, '0', m.length - e - 1, true)
  }
  if (m.indexOf('.') == -1) {
    m = m + '.0'
  }
  const a = m.split('.')
  const mi = parseInt(a[0], 2)
  let mf = 0
  for (let i = 0; i < a[1].length; i++) {
    mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1))
  }
  m = (parseInt(mi.toString()) + parseFloat(mf.toString())).toString()
  if (s == 1) {
    m = (0 - Number(m)).toString()
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
// const utf16ToUtf8 = (utf16Str) => {
//   const utf8Arr = []
//   let byteSize = 0
//   for (let i = 0; i < utf16Str.length; i++) {
//     //获取字符Unicode码值
//     const code = utf16Str.charCodeAt(i)

//     //如果码值是1个字节的范围，则直接写入
//     if (code >= 0x00 && code <= 0x7f) {
//       byteSize += 1
//       utf8Arr.push(code)

//       //如果码值是2个字节以上的范围，则按规则进行填充补码转换
//     } else if (code >= 0x80 && code <= 0x7ff) {
//       byteSize += 2
//       utf8Arr.push(192 | (31 & (code >> 6)))
//       utf8Arr.push(128 | (63 & code))
//     } else if ((code >= 0x800 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xffff)) {
//       byteSize += 3
//       utf8Arr.push(224 | (15 & (code >> 12)))
//       utf8Arr.push(128 | (63 & (code >> 6)))
//       utf8Arr.push(128 | (63 & code))
//     } else if (code >= 0x10000 && code <= 0x10ffff) {
//       byteSize += 4
//       utf8Arr.push(240 | (7 & (code >> 18)))
//       utf8Arr.push(128 | (63 & (code >> 12)))
//       utf8Arr.push(128 | (63 & (code >> 6)))
//       utf8Arr.push(128 | (63 & code))
//     }
//   }

//   return utf8Arr
// }
// const utf8ToUtf16 = (utf8Arr) => {
//   let utf16Str = ''
//   for (let i = 0; i < utf8Arr.length; i++) {
//     //每个字节都转换为2进制字符串进行判断https://blog.csdn.net/qq_40011214/article/details/121281242
//     const one = utf8Arr[i].toString(2)
//     //正则表达式判断该字节是否符合>=2个1和1个0的情况
//     const v = one.match(/^1+?(?=0)/)
//     //多个字节编码
//     if (v && one.length == 8) {
//       //获取该编码是多少个字节长度
//       const bytesLength = v[0].length
//       //首个字节中的数据,因为首字节有效数据长度为8位减去1个0位，再减去bytesLength位的剩余位数
//       let store = utf8Arr[i].toString(2).slice(7 - bytesLength)
//       for (let st = 1; st < bytesLength; st++) {
//         //后面剩余字节中的数据，因为后面字节都是10xxxxxxx，所以slice中的2指的是去除10
//         store += utf8Arr[st + i].toString(2).slice(2)
//       }
//       //转换为Unicode码值
//       utf16Str += String.fromCharCode(parseInt(store, 2))
//       //调整剩余字节数
//       i += bytesLength - 1
//     } else {
//       //单个字节编码，和Unicode码值一致，直接将该字节转换为UTF-16
//       utf16Str += String.fromCharCode(utf8Arr[i])
//     }
//   }

//   return utf16Str
// }
// const revertUTF8 = (szInput) => {
//   let x,
//     wch,
//     wch1,
//     wch2,
//     uch = '',
//     szRet = ''
//   for (x = 0; x < szInput.length; x++) {
//     if (szInput.toString().charAt(x) == '%') {
//       wch = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
//       if (!wch) {
//         break
//       }
//       if (!(wch & 0x80)) {
//         wch = wch
//       } else if (!(wch & 0x20)) {
//         x++
//         wch1 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
//         wch = (wch & 0x1f) << 6
//         wch1 = wch1 & 0x3f
//         wch = wch + wch1
//       } else {
//         x++
//         wch1 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
//         x++
//         wch2 = parseInt(szInput.toString().charAt(++x) + szInput.toString().charAt(++x), 16)
//         wch = (wch & 0x0f) << 12
//         wch1 = (wch1 & 0x3f) << 6
//         wch2 = wch2 & 0x3f
//         wch = wch + wch1 + wch2
//       }
//       szRet += String.fromCharCode(wch)
//     } else {
//       szRet += szInput.toString().charAt(x)
//     }
//   }
//   return szRet
// }
const IntToBytesBigEndian = (number, length) => {
  const bytes = [] as any[]
  let i = length
  do {
    bytes[--i] = number & 255
    number = number >> 8
  } while (i)
  return bytes
}
export default {
  HexToDouble,
  hexToSingle,
  hexToInt,
  hex2float,
  IntToBytesBigEndian
}
