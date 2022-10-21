<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useDragStore } from '@renderer/store/modules/userDraggable'
import { userStore } from '@renderer/store/modules/user'
const user = userStore()
const userDragStore = useDragStore()
console.log('userDragStore.------getDragInfo', userDragStore.getDragInfo)
const data = reactive({
  lala: userDragStore.getDragInfo
})

// 调用state、getters数据
const { age, firstname, name } = storeToRefs(user)

function handleClick(): void {
  // 单个改值
  // age.value += 1

  // 批量改值
  user.$patch((state) => {
    state.age++
    state.firstname = '郑'
  })
}

function add(): void {
  // 调用store中的actions方法
  user.plusAge(200)
}

function reset(): void {
  // 调用store自带的reset重置方法
  user.$reset()
}
</script>

<template>
  <div>
    测试
    <button @click="handleClick">handleClick</button>
    <button @click="add">add</button>
    <button @click="reset">reset</button>
    {{ age }}
    {{ firstname }}
    {{ name }}
    {{ data.lala }}
    <!-- {{ data.lala.getDragInfo }} -->
  </div>
</template>
