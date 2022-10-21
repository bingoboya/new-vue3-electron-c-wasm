<script setup lang="ts">
import { reactive } from 'vue'
const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
const runonRightEnv = isInElectron && navigator.platform === 'Win32'
const versions = runonRightEnv
  ? reactive({ ...window.electron.process.versions })
  : {
      electron: 123,
      chrome: 123,
      node: 123,
      v8: 123
    }
const getEnv = (): void => {
  console.log('window.electron.process', window.electron, window.api)
}

runonRightEnv && window.electron.ipcRenderer.on('configfilePaths', (_, message) => {
    console.log('选择的配置文件----', message)
})
</script>

<template>
  <ul class="versions">
    <li class="electron-version" @click="getEnv">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
    <li class="v8-version">V8 v{{ versions.v8 }}</li>
  </ul>
</template>
