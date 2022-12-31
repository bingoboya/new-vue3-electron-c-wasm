<template>
  <DashBoard />
  <!-- <input type="text" v-model="data.message" />
  <button @click="postMessage">send msg</button> -->
  <!-- <div>
    <Versions />
    <svg class="hero-logo" viewBox="0 0 900 300">
      <use xlink:href="@renderer/assets/icons.svg#electron" />
    </svg>
  </div> -->
</template>
<script setup>
import DashBoard from '@renderer/views/DashBoard/index.vue'
// import Versions from '@renderer/components/Versions.vue'

/*
  import { sendMessage } from './worker-api'
  const data = reactive({
    message: ''
  })
  const postMessage = () => {
    sendMessage(data.message)
  }
  function demo() {
    console.log('isok')
  }
  let blob = new Blob([demo.toString() + ' demo()'], { type: 'text/javascript' })
  let worker = new Worker(URL.createObjectURL(blob))
  console.log(1111, worker)
*/
</script>
<style lang="less">
@import './assets/css/styles.less';

.wrapper {
  width: 100%;
  height: 100%;
  padding: 30px;
}

#chart-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}
</style>
