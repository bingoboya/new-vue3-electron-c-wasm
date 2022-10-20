<script setup lang="ts">
import { reactive } from 'vue'


const versions = reactive({ ...window.electron.process.versions })
const getEnv = (): void => {
  console.log('window.electron.process', window.electron, window.api)
}


window.electron.ipcRenderer.on('configfilePaths', (_, message) => {
      console.log('选择的配置文件----', message);
    });


</script>

<template>
  <ul class="versions">
    <li class="electron-version" @click="getEnv">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
    <li class="v8-version">V8 v{{ versions.v8 }}</li>
  </ul>
</template>
