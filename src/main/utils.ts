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

const hexToInt = (hexBuf) => {
  // 十六进制 转 十进制 Number('0x' + '000e')
  return Number('0x' + hexBuf.toString('hex'))
}
export default {
  HexToDouble,
  hexToSingle,
  hexToInt
}
