import * as Comlink from 'comlink'

const fns = {
  toUpperCase(msg) {
    return msg.toUpperCase()
  },
  doHardWork() {
    let i = 0
    while (i < 9000000000) {
      i++
    }
    return i
  }
}

Comlink.expose(fns)





// self.addEventListener('message', (e) => {
//   console.log('worker got', e)

//   self.postMessage(e.data.toUpperCase())
// })