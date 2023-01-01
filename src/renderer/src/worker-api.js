// import Worker from 'worker-loader!./worker'
import * as Comlink from 'comlink'

const DataProcessor = Comlink.wrap(
  new Worker(new URL('./worker?worker&inline', import.meta.url), {
    type: 'module'
  })
)

// export const processor = await new DataProcessor()
export const processor = DataProcessor

export const toUpperCase = processor.toUpperCase
export const doHardWork = processor.doHardWork
export const getArr = processor.getArr
export const getCircleValbyId = processor.getCircleValbyId
export const pushArr = processor.pushArr
export const pushBetyArr = processor.pushBetyArr
export const clearArr = processor.clearArr
export const sendSocketCommand = processor.sendSocketCommand

export function updateTreeList(cb) {
  processor.remoteFunUpdateTreeList(Comlink.proxy(cb))
}
export function initToolBars(cb) {
  processor.remoteFunInitToolBars(Comlink.proxy(cb))
}
export function updateDataFlag(cb) {
  processor.remoteFunUpdateFlag(Comlink.proxy(cb))
}

// export const getArr = worker.getArr
// export const toUpperCase = worker.toUpperCase
// export const doHardWork = worker.doHardWork

// processor.addEventListener('message', (va) => {
//   console.log('getbackmsg', va)
// })

// export function sendMessage(msg) {
//   worker.postMessage(msg)
// }
