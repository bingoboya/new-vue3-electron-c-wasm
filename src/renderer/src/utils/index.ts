import type { App, Plugin } from 'vue'
import html2canvas from 'html2canvas'
import FileSaver from 'file-saver'

import { isObject } from '@renderer/utils/is'

import ImgMerge from './imgMerge.js'

export const noop = (): any => {}

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = ''
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&'
  }
  parameters = parameters.replace(/&$/, '')
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

export const withInstall = <T>(component: T, alias?: string): any => {
  const comp = component as any
  comp.install = (app: App): any => {
    app.component(comp.name || comp.displayName)
    if (alias) {
      app.config.globalProperties[alias] = component
    }
  }
  return component as T & Plugin
}

export const createGlobleFileInput = () => {
  const fileInputEle = document.createElement('input')
  fileInputEle.type = 'file'
  fileInputEle.id = 'globleFileInput'
  fileInputEle.style.visibility = 'hidden'
  document.body.append(fileInputEle)
  fileInputEle?.addEventListener('change', async () => {
    const fileList = await fileInputEle?.files
    console.log('选择配置文件的路径', fileList)
  })
}

export const getNavigatorStore = async () => {
  // 检查浏览器是否支持持久化存储，即在用户关闭浏览器后仍然保存存储数据,
  // 该方法也会返回一个 Promise 对象，其中包含一个布尔值，表示浏览器是否支持持久化存储
  const persisted = await navigator.storage.persisted()
  // 查看浏览器存储配额
  navigator.storage.estimate().then((quotaUsage: any) => {
    const usagegb = quotaUsage.usage / 1024 / 1024 // bytes
    const quotagb = quotaUsage.quota / 1024 / 1024 // bytes
    console.log(`已使用的存储空间: ${usagegb}Mb`)
    console.log(`总共可用的存储空间: ${quotagb}Mb`, persisted ? '支持持久化存储' : 'no持久化存储')
  })
}
export const checkWebGLFunc = async () => {
  const canvas = document.createElement('canvas')
  // 获取 canvas 的绘图上下文
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  // 判断上下文是否为 WebGLRenderingContext 类型
  const checkWebGL = context instanceof WebGLRenderingContext
  if (checkWebGL) {
    console.log('浏览器支持 WebGL')
  } else {
    console.log('浏览器不支持 WebGL')
  }
  return checkWebGL
}

export const imgMergeFunc = async (
  legendImgUrl,
  lineBase64Url,
  legendDragStyle,
  canvasHeight,
  canvasWidth
) => {
  const { height, width, initialX, initialY } = legendDragStyle
  const imgMergeInstance = new ImgMerge([
    // 调整 width，height 可以调节清晰度
    { url: lineBase64Url, x: 0, y: 0, width: canvasWidth * 4, height: canvasHeight * 4 },
    { url: legendImgUrl, x: initialX * 4, y: initialY * 4, width: width * 2, height: height * 2 }
  ])
  imgMergeInstance.then((img) => {
    const mergeImg = new Image()
    // bingourl.bingourl2 = img
    mergeImg.src = img
    mergeImg.onload = () => {
      document.body.appendChild(mergeImg)
      html2canvas(mergeImg).then((canvas) => {
        // const imgUrl = canvas.toDataURL('image/png', 1) // 将canvas转换成img的src流
        //将canvas内容保存为文件并下载
        canvas.toBlob(function (blob) {
          // console.log('canvas', blob)
          FileSaver.saveAs(blob, 'downEchart.png')
        })
      })
    }
  })
}