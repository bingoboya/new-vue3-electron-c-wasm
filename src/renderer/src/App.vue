<script setup lang="ts">
import Versions from '@renderer/components/Versions.vue'
const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
const runonRightEnv = isInElectron && navigator.platform === 'Win32'
console.log('运行在electron环境:', isInElectron, 'navigator.platform1', navigator.platform)
const checkoutRootDir = async (): Promise<void> => {
  if (!runonRightEnv) return
  const msg = await window.electron.ipcRenderer.invoke('checkout-RootDir')
  console.log('查看根目录', msg)
}
const startExe = async (): Promise<void> => {
  if (!runonRightEnv) return
  console.log('点击启动程序')
  window.electron.ipcRenderer.send('startExe')
}
const communicationExe = async (): Promise<void> => {
  if (!runonRightEnv) return
  console.log('点击与exe通信')
  window.electron.ipcRenderer.send('communicationExe')
}
const killExe = async (): Promise<void> => {
  if (!runonRightEnv) return
  console.log('点击关闭exe')
  window.electron.ipcRenderer.send('killExe')
}
runonRightEnv &&
  window.electron.ipcRenderer.on('sendmsg-from-main-process-to-APP.vue', (_, message) => {
    console.log('APP.vue接受消息', message)
  })
</script>

<template>
  <Versions></Versions>
  <button @click="checkoutRootDir">查看根目录</button>
  <button @click="startExe">启动exe</button>
  <button @click="communicationExe">与exe通信</button>
  <button @click="killExe">关闭exe</button>
  <svg class="hero-logo" viewBox="0 0 900 300">
    <use xlink:href="./assets/icons.svg#electron" />
  </svg>
  <h2 class="hero-text">You've successfully created an Electron project with Vue and TypeScript</h2>
  <p class="hero-tagline">Please try pressing <code>F12</code> to open the devTool</p>

  <div class="links">
    <div class="link-item">
      <a target="_blank" href="https://evite.netlify.app">Documentation</a>
    </div>
    <div class="link-item link-dot">•</div>
    <div class="link-item">
      <a target="_blank" href="https://github.com/alex8088/electron-vite">Getting Help</a>
    </div>
    <div class="link-item link-dot">•</div>
    <div class="link-item">
      <a
        target="_blank"
        href="https://github.com/alex8088/quick-start/tree/master/packages/create-electron"
      >
        create-electron
      </a>
    </div>
  </div>

  <div class="features">
    <div class="feature-item">
      <article>
        <h2 class="title">Configuring</h2>
        <p class="detail">
          Config with <span>electron.vite.config.ts</span> and refer to the
          <a target="_blank" href="https://evite.netlify.app/config/">config guide</a>.
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">HMR</h2>
        <p class="detail">
          Edit <span>src/renderer</span> files to test HMR. See
          <a target="_blank" href="https://evite.netlify.app/guide/hmr-in-renderer.html">docs</a>.
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">Hot Reloading</h2>
        <p class="detail">
          Run <span>'electron-vite dev --watch'</span> to enable. See
          <a target="_blank" href="https://evite.netlify.app/guide/hot-reloading.html">docs</a>.
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">Debugging</h2>
        <p class="detail">
          Check out <span>.vscode/launch.json</span>. See
          <a target="_blank" href="https://evite.netlify.app/guide/debugging.html">docs</a>.
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">Source Code Protection</h2>
        <p class="detail">
          Supported via built-in plugin <span>bytecodePlugin</span>. See
          <a target="_blank" href="https://evite.netlify.app/guide/source-code-protection.html">
            docs
          </a>
          .
        </p>
      </article>
    </div>
    <div class="feature-item">
      <article>
        <h2 class="title">Packaging</h2>
        <p class="detail">
          Use
          <a target="_blank" href="https://www.electron.build">electron-builder</a>
          and pre-configured to pack your app.
        </p>
      </article>
    </div>
  </div>
</template>

<style lang="less">
@import './assets/css/styles.less';
</style>
