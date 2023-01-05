// import Worker from 'worker-loader!./worker'
import * as Comlink from 'comlink'

const worker = Comlink.wrap(
  new Worker(new URL('./worker?worker&inline', import.meta.url), {
    type: 'module'
  })
)

// export const processor = await new DataProcessor()
// export const processor = DataProcessor

export const toUpperCase = worker.toUpperCase
export const doHardWork = worker.doHardWork
export const getArr = worker.getArr
export const getCircleValbyId = worker.getCircleValbyId
export const getCicleDataByToolBars = worker.getCicleDataByToolBars
export const remoteFunUpdateTreeList = worker.remoteFunUpdateTreeList
export const remoteFunInitToolBars = worker.remoteFunInitToolBars
export const remoteFunUpdateFlag = worker.remoteFunUpdateFlag
export const setNewtoolbarsMap = worker.setNewtoolbarsMap
export const pushArr = worker.pushArr
export const sendSocketCommand = worker.sendSocketCommand
export const getwholeOptionsMap = worker.getwholeOptionsMap


// export const getArr = worker.getArr
// export const toUpperCase = worker.toUpperCase
// export const doHardWork = worker.doHardWork

// processor.addEventListener('message', (va) => {
//   console.log('getbackmsg', va)
// })

// export function sendMessage(msg) {
//   worker.postMessage(msg)
// }
