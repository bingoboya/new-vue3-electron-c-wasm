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
// export const pushArr = worker.pushArr
export const sendSocketCommand = worker.sendSocketCommand
export const sendSocketParams = worker.sendSocketParams


/*
  基于blob对象动态封装一个web worker
  function demo() {
    console.log('isok')
  }
  let blob = new Blob([demo.toString() + ' demo()'], { type: 'text/javascript' })
  let worker = new Worker(URL.createObjectURL(blob))
  console.log(1111, worker)
*/