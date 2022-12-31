import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

//////////
// 在预加载文件中使用【cluster】启新线程
// const cluster = require('child_process')
// const net = require('net')

// let myScoket = null as any
// const socketServer = net.createServer((client_sock) => {
//   myScoket = client_sock
//   client_sock.on('data', function (data) {
//     console.log(4444444, data)
//   })
// })
// socketServer.on('listening', function () {
//   console.log('start listening...')
// })
// socketServer.listen({
//   port: 8099,
//   host: '127.0.0.1',
//   exclusive: true
// })

// ipcMain.on('sendSocketpre', (_event, arg) => {
//   if (process.platform === 'darwin') {
//     myScoket.write(arg + '', () => {
//       console.log('数据发送成功：', arg)
//     })
//   } else {
//     // handleExeFunc(arg)
//   }
// })

// setInterval(() => {
//   // cluster.exec('cmd /c chcp 65001>nul && netsh wlan show interface', (err, res) => {
//   //   const node_nics = require('os').networkInterfaces()
//   //   const lines = res.split('\r\n')
//   //   const fields = [
//   //     'name',
//   //     'model',
//   //     'vendor',
//   //     'mac_address',
//   //     'status',
//   //     'ssid',
//   //     'bssid',
//   //     'mode',
//   //     'radio',
//   //     'authentication',
//   //     'encryption',
//   //     'connection',
//   //     'channel',
//   //     'reception',
//   //     'transmission',
//   //     'signal',
//   //     'profil'
//   //   ]
//   //   const connections = [] as any
//   //   let tmp = {} as any
//   //   let len = 0
//   //   for (let i = 3; i < lines.length; i++) {
//   //     if (lines[i] != '' && lines[i] != null && lines[i].indexOf(':') != -1) {
//   //       tmp[fields[len]] = lines[i].split(':')[1].trim()
//   //       len += 1
//   //     } else {
//   //       if (
//   //         tmp['name'] != null &&
//   //         tmp['model'] != null &&
//   //         tmp['vendor'] != null &&
//   //         tmp['mac_address'] != null &&
//   //         tmp['status'] != null
//   //       ) {
//   //         const node_nic = node_nics[tmp.name] || []
//   //         node_nic.forEach(function (type) {
//   //           if (type.family == 'IPv4') {
//   //             tmp.ip_address = type.address
//   //             tmp.ip_gateway =
//   //               'http://' +
//   //               type.address.split('.')[0] +
//   //               '.' +
//   //               type.address.split('.')[1] +
//   //               '.' +
//   //               type.address.split('.')[2] +
//   //               '.1'
//   //           }
//   //         })
//   //         connections.push(tmp)
//   //         tmp = {}
//   //         len = 0
//   //       }
//   //     }
//   //   }
//   //   self.postMessage(connections)
//   // })
//   console.log(111, 'dsdsdsdsdsdsd')
// }, 2000)

//////////

console.log('run=>preloadjs')
// console.log(import.meta.env.DEV)
interface RootObject {
  bingo: string
}
// Custom APIs for renderer
// 安装插件 JSON to TS, 选中上面的json， 快捷键 ctrl + shif + alt + s，自动生成ts
const apibingo: RootObject = { bingo: 'sd' }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
// 下面的配置，在渲染进程中可以使用 window.electron.ipcRenderer，process，webFrame
// 在渲染进程中 log window.electron或者 log window.apibingo
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', apibingo)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.apibingo = apibingo
  // @ts-ignore (define in dts)
}
