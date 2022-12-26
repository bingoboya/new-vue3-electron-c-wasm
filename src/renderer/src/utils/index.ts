import type { App, Plugin } from 'vue';

import { isObject } from '@renderer/utils/is';

export const noop = (): any => {}

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
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
  let parameters = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}




export const withInstall = <T>(component: T, alias?: string): any => {
  const comp = component as any;
  comp.install = (app: App): any => {
    app.component(comp.name || comp.displayName);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};

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
