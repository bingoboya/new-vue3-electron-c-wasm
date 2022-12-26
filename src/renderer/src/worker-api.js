// import Worker from 'worker-loader!./worker'
import * as Comlink from 'comlink'

const worker = Comlink.wrap(
  new Worker(new URL('./worker?worker&inline', import.meta.url), {
    type: 'module'
  })
)

export const toUpperCase = worker.toUpperCase

export const doHardWork = worker.doHardWork




// worker.addEventListener('message', (e) => {
//   console.log('getbackmsg', e.data)
// })

// export function sendMessage(msg) {
//   worker.postMessage(msg)
// }
