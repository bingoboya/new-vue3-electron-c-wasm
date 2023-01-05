<template>
  <div style="display: flex; flex-direction: column">
    <el-input v-model="query" placeholder="Please enter keyword" @input="onQueryChanged" />
    <el-tree-v2 ref="treeRef" :data="data.treeData" :props="props" :height="propsss.wrapheight"
      :filter-method="filterMethod" @node-click="nodeClick">
      <template #default="{ node }">
        <TreeNodeVue :treeNode="node" />
        <!-- <div :draggable="node.isLeaf" :onDragstart="onDragstart">
          {{ node.isLeaf }}{{ node.label }}
        </div> -->
      </template>
    </el-tree-v2>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { remoteFunUpdateTreeList } from '@renderer/worker-api'
import * as Comlink from 'comlink'

import TreeNodeVue from './TreeNode.vue'
// const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1
// const runonRightEnv = isInElectron && navigator.platform === 'Win32'
const propsss = defineProps({
  wrapheight: {
    type: Number,
    required: true
  }
})
const getTreeList = (arg) => {
  console.log('getTreeList111111', arg)
  data.treeData = [...arg]
}
onMounted(() => {
  // 挂载监听函数，更新tree
  remoteFunUpdateTreeList(Comlink.proxy(getTreeList))
})
// interface Tree {
//   id: string
//   label: string
//   children?: Tree[]
// }
const props = {
  value: 'id',
  label: 'label',
  children: 'children'
}
const query = ref('')
const treeRef = ref()
const data = reactive({
  treeData: [] as any[]
})
const onQueryChanged = (query: string) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
}
const filterMethod = (query: string, node) => {
  return node.label!.includes(query)
}
const nodeClick = (data, node, e) => {
  console.log('nodeClick', data, node, e)
}
</script>
