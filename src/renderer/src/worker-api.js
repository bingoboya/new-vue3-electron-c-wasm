// import Worker from 'worker-loader!./worker'
import * as Comlink from 'comlink'

const DataProcessor = Comlink.wrap(
  new Worker(new URL('./worker?worker&inline', import.meta.url), {
    type: 'module'
  })
)

let processor = await new DataProcessor()

export const toUpperCase = processor.toUpperCase
export const doHardWork = processor.doHardWork
export const getArr = processor.getArr
export const getCircleValbyId = processor.getCircleValbyId
export const pushArr = processor.pushArr
export const pushBetyArr = processor.pushBetyArr
export const clearArr = processor.clearArr


// export const getArr = worker.getArr
// export const toUpperCase = worker.toUpperCase
// export const doHardWork = worker.doHardWork




// worker.addEventListener('message', (e) => {
//   console.log('getbackmsg', e.data)
// })

// export function sendMessage(msg) {
//   worker.postMessage(msg)
// }
