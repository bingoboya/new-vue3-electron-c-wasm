<template>
  <div style="display: flex; gap: 4px">
    <!-- <el-button @click="checkoutRootDir">查看根目录1</el-button> -->
    <!-- <button @click="postMessage">send worker</button> -->
    <!-- <button @click="pushArrtoWorker">pushArrtoWorker</button> -->
    <div class="btn circle" @click="state.paramsDrawer = true">参数配置</div>
    {{ fpsVal }}
    <div class="btn circle" @click="sendSocket(2101)">暂停计算</div>
    <div class="btn circle" @click="sendSocket(2102)">继续计算</div>
    <div class="btn circle" @click="sendSocket(2103)">退出计算</div>
    <!-- <div class="btn circle" @click="sendSocket(2100)">开始计算</div> -->
    <!-- <div v-if="!runonRightEnv" class="btn circle" @click="sendSocket(2104)">获取目录</div> -->
    <div class="btn circle" @click="getWorkerArr">getWorkerArr</div>
    <span style="font-size: 18px">{{ state.time.getMinutes() }}:{{ state.time.getSeconds() }}</span>
    <!-- <el-dropdown split-button type="primary" @command="sendSocket">
      操作
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="2100">直接开始计算</el-dropdown-item>
          <el-dropdown-item :command="2101">暂停计算</el-dropdown-item>
          <el-dropdown-item :command="2102">继续计算</el-dropdown-item>
          <el-dropdown-item :command="2103">退出计算</el-dropdown-item>
          <el-dropdown-item :command="2104">获取目录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown> -->
  </div>
  <el-drawer ref="drawerRef" v-model="state.paramsDrawer" title="基本参数配置" direction="rtl">
    <div class="demo-drawer__content">
      <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="120px">
        <el-form-item>
          <el-button @click="chooseFile">选择配置文件</el-button>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-input disabled v-model="ruleForm.startTime"><template #append>s</template></el-input>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="ruleForm.endTime"><template #append>s</template></el-input>
        </el-form-item>
        <el-form-item label="计算步长" prop="stepTime">
          <el-input v-model="ruleForm.stepTime"><template #append>μs</template></el-input>
        </el-form-item>
        <el-form-item label="采样频率" prop="frequency">
          <el-input v-model="ruleForm.frequency" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
        </el-form-item>
      </el-form>
      <!-- <div class="demo-drawer__footer">
        <el-button @click="state.paramsDrawer = false">确定</el-button>
      </div> -->
    </div>
  </el-drawer>
</template>
<script setup>
import Dexie from 'dexie'
import { reactive } from 'vue'
import { createGlobleFileInput, getNavigatorStore } from '@renderer/utils'
// import { doHardWork, toUpperCase, getArr, pushArr, sendSocketCommand } from '@renderer/worker-api'
import { getArr, sendSocketCommand, sendSocketParams } from '@renderer/worker-api'
const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
const runonRightEnv = isInElectron && navigator.platform === 'Win32'
console.log('platform', navigator.platform)
getNavigatorStore()
const ruleFormRef = ref()
const validateStepTime = (rule, value, callback) => {
  if (value === '') {
    return callback(new Error('不能为空'))
  }
  const check = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
  if (check.test(value)) {
    callback()
  } else {
    return callback(new Error('格式不对'))
  }
}

// Measure FPS.
const fpsVal = ref('')
let tFpsStart = window.performance.now()
let frames = 0
let fps = 0
const recordFrame = () => {
  frames++
  const tNow = window.performance.now()
  fps = 1000 / ((tNow - tFpsStart) / frames)
  requestAnimationFrame(recordFrame)
  fpsVal.value = ` (FPS: ${fps.toFixed(1)})`
}
requestAnimationFrame(recordFrame)
setInterval(() => {
  tFpsStart = window.performance.now()
  frames = 0
}, 5000)

const getWorkerArr = async () => {
  // const db = new Dexie('FriendDatabase')
  // const tab = await db.Table('messagetbl')
  // const a = await db.messagetbl
  // console.log('db----:', db, tab, a)
  await getArr()
}
const ruleForm = reactive({
  firstFile: 'a.csv',
  secondFile: 'b.xlsx',
  startTime: 0,
  endTime: 10,
  stepTime: 50,
  frequency: 1 // 采样频率，每n个点给我发送一次
})
const rules = reactive({
  startTime: [{ validator: validateStepTime, trigger: 'change' }],
  endTime: [{ validator: validateStepTime, trigger: 'change' }],
  stepTime: [{ validator: validateStepTime, trigger: 'change' }],
  frequency: [{ validator: validateStepTime, trigger: 'change' }]
})
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      console.log('toRaw(ruleForm)1', toRaw(ruleForm))
      const params = toRaw(ruleForm)
      params.stepTime = params.stepTime / 1000000
      console.log('toRaw(ruleForm)2', params)
      if (runonRightEnv) {
        startExeInWin(params)
      } else {
        startExeInMac(params)
      }
      state.paramsDrawer = false
    } else {
      return false
    }
  })
}
const startExeInMac = (params) => {
  sendSocketParams(JSON.stringify(params))
}
const state = reactive({
  paramsDrawer: false,
  time: new Date()
})

onMounted(() => {
  createGlobleFileInput()
  setInterval(() => {
    state.time = new Date()
  }, 300)
})
/*
  该文件内的操作直接在 DashBoard/index.vue中执行时会出现无效的情况（仅出现在执行脚本 [yarn build:win] 打包windows环境的生产包时），原因未知
  解决：新建HandleExe.vue文件，将代码移动到该文件中，再在DashBoard/index.vue中引用，就可以解决
*/
const startExeInWin = async (params) => {
  console.log('startExe-InWin', import.meta.env, params)
  isInElectron && window.electron?.ipcRenderer.send('startExe', params)
}

const sendSocket = async (command) => {
  console.log('发送soc-ket', command)
  sendSocketCommand(command)
}
isInElectron &&
  window.electron?.ipcRenderer.on('configfilePaths', (_, message) => {
    console.log('选择的配置文件----', message)
    // 需要根据文件后缀名设置两个文件
    ruleForm.firstFile = message[0]
    ruleForm.secondFile = message[1]
  })
runonRightEnv &&
  window.electron.ipcRenderer.on('shutdownexe', (_) => {
    // 关闭exe进程
    sendSocketCommand(2103)
  })
runonRightEnv &&
  window.electron.ipcRenderer.on('sendmsg-from-main-process-to-APP.vue', (_, message) => {
    console.log('APP.vue接受消息', message)
  })
const chooseFile = async () => {
  if (!isInElectron) {
    // '不在electron环境中，不能调用主进程，可以调原生api，但是由于浏览器出于安全考虑，新版本浏览器input:file或者node fs模块，都拿不到文件路径'
    // 但是这个方法可以在electron环境中运行时拿到文件路径
    document.getElementById('globleFileInput')?.click()
  } else {
    window.electron?.ipcRenderer.send('openDialog')
  }
}
// const pushArrtoWorker = async () => {
//   const newArr = ['dd', 'qw', { dd: 3 }]
//   await pushArr(newArr)
//   console.log('pushArrtoWorker===>', newArr)
// }

// const postMessage = async () => {
//   console.log('worker计算开始---')
//   const result1 = await toUpperCase('abc')
//   const result = await doHardWork()
//   console.log('worker计算完成---', result, result1)
//   // const result2 = doHardWorkss()
//   // console.log('js占用结束', result2)
// }
// const doHardWorkss = () => {
//   console.log('js开始占用')
//   let i = 0
//   while (i < 9000000000) {
//     i++
//   }
//   return i
// }
const checkoutRootDir = async () => {
  console.log('查看根目录')
  if (!runonRightEnv) return
  const msg = await window.electron.ipcRenderer.invoke('checkout-RootDir')
  console.log('查看根目录', msg)
}
</script>
<style lang="less">
.el-drawer {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
<style lang="less" scoped>
.btn {
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  // font-size: 2rem;
  // letter-spacing: 1rem;
  // text-indent: 1rem;
  border-radius: 4px;
  padding: 0 4px;
  box-sizing: border-box;
}
.circle {
  font-size: 14px;
  border: 1px solid gray;
  color: #3e3e3e;
  position: relative;
  z-index: 1;
  overflow: hidden;
  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #000 10%, rgba(0, 0, 0, 0) 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10);
    opacity: 0;
    transition: transform 0.5s, opacity 1s;
  }

  &:active:after {
    transform: scale(0);
    opacity: 0.2;
    transition: 0s;
  }
}

.circle::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  transform: translate3d(-50%, -50%, 0) scale(0, 0);
  border-radius: 50%;
  background-color: #b2b0af50;
  transform-origin: center;
  transition: ease-in-out 0.5s;
}

.circle:hover::before {
  transform: translate3d(-50%, -50%, 0) scale(15, 15);
}
</style>
