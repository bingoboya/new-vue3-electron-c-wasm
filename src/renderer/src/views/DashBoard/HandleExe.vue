<template>
    <div>
        <button @click="checkoutRootDir">查看根目录1</button>
      <button @click="startExe">启动exe</button>
      <button @click="communicationExe">与exe通信</button>
      <button @click="killExe">关闭exe</button>
    </div>
</template>
<script setup>
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
const communicationExe = async () => {
  console.log('点击与exe通信')
  
  runonRightEnv && window.electron.ipcRenderer.send('communicationExe')
}
const killExe = async () => {
  console.log('点击关闭exe')
  
  runonRightEnv && window.electron.ipcRenderer.send('killExe')
}
window.electron.ipcRenderer.on('sendmsg-from-main-process-to-APP.vue', (_, message) => {
    console.log('APP.vue接受消息', message)
  })
</script>