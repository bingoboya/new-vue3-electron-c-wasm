import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('app.isPackaged')

// Custom APIs for renderer
// 安装插件 JSON to TS, 选中上面的json， 快捷键 ctrl + shif + alt + s，自动生成ts
const api = {
  bingo: 'sd',
  isPackaged: ''
}


// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
