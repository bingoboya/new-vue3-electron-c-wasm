<template>
  <div>
    <el-button @click="checkoutRootDir">查看根目录1</el-button>
    <el-button style="margin-right: 10px" @click="startExe">启动exe</el-button>
    <span style="font-size: 30px">{{ data.time.getMinutes() }}:{{ data.time.getSeconds() }}</span>
    <!-- <el-button @click="communicationExe">与exe通信</el-button>
    <el-button @click="killExe">关闭exe</el-button> -->
    <button @click="sendSocket(2100)">直接开始计算</button>
    <button @click="sendSocket(2101)">暂停计算</button>
    <button @click="sendSocket(2102)">继续计算</button>
    <button @click="sendSocket(2103)">退出计算</button>
    <button @click="sendSocket(2104)">启动exe</button>
    <input style="width: 80px" type="text" v-model="data.message" />
    <button @click="postMessage">send worker</button>
    <!-- <el-dropdown split-button type="primary" @command="sendSocket">
      操作
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="2100">直接开始计算</el-dropdown-item>
          <el-dropdown-item :command="2101">暂停计算</el-dropdown-item>
          <el-dropdown-item :command="2102">继续计算</el-dropdown-item>
          <el-dropdown-item :command="2103">退出计算</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown> -->
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { doHardWork, toUpperCase } from '@renderer/worker-api'
const data = reactive({
  message: '',
  time: new Date()
})
// console.log('查看逻辑处理器内核数量', navigator.hardwareConcurrency)
const postMessage = async () => {
  console.log('worker计算开始---')
  const result1 = await toUpperCase(data.message)
  const result = await doHardWork()
  console.log('worker计算完成---', result, result1)
  const result2 = doHardWorkss()
  console.log('js占用结束', result2)
}
const doHardWorkss = () => {
  console.log('js开始占用')
  let i = 0
  while (i < 9000000000) {
    i++
  }
  return i
}
onMounted(() => {
  setInterval(() => {
    data.time = new Date()
  }, 300)
})
/*
  TODO基于blob对象动态封装一个web worker
  function demo() {
    console.log('isok')
  }
  let blob = new Blob([demo.toString() + ' demo()'], { type: 'text/javascript' })
  let worker = new Worker(URL.createObjectURL(blob))
  console.log(1111, worker)
*/
/*
  该文件内的操作直接在 DashBoard/index.vue中执行时会出现无效的情况（仅出现在执行脚本 [yarn build:win] 打包windows环境的生产包时），原因未知
  解决：新建HandleExe.vue文件，将代码移动到该文件中，再在DashBoard/index.vue中引用，就可以解决
*/
const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
const runonRightEnv = isInElectron && navigator.platform === 'Win32'
console.log('运行在electron环境:', isInElectron, 'navigator.platform1', navigator.platform)
const checkoutRootDir = async () => {
  console.log('查看根目录')
  if (!runonRightEnv) return
  const msg = await window.electron.ipcRenderer.invoke('checkout-RootDir')
  console.log('查看根目录', msg)
}
const startExe = async () => {
  console.log('点击启动程序', import.meta.env)
  runonRightEnv && window.electron.ipcRenderer.send('startExe')
}
const sendSocket = async (command) => {
  console.log('点击发送soc-ket', command)
  isInElectron && window.electron.ipcRenderer.send('sendSocket', command)
}
runonRightEnv &&
  window.electron.ipcRenderer.on('sendmsg-from-main-process-to-APP.vue', (_, message) => {
    console.log('APP.vue接受消息', message)
  })
const communicationExe = async () => {
  console.log('点击与exe通信')
  isInElectron && window.electron.ipcRenderer.send('communicationExe')
}
const killExe = async () => {
  console.log('点击关闭exe')
  runonRightEnv && window.electron.ipcRenderer.send('killExe')
}
</script>
