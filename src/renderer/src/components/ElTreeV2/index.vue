<template>
  <el-tree-v2 :data="myData" :props="props" :height="propsss.wrapheight" @node-click="nodeClick" />
</template>
<script lang="ts" setup>
import { defineProps } from 'vue'
const propsss = defineProps({
  wrapheight: {
    type: Number,
    required: true
  }
})

console.log(12323, propsss.wrapheight) // [1,2,3,4,5]

interface Tree {
  id: string
  label: string
  children?: Tree[]
}
const nodeClick = (data, node, e) => {
  console.log('nodeClick', data, node, e)
}
const getKey = (prefix: string, id: number) => {
  return `${prefix}-${id}`
}

const createData = (
  maxDeep: number,
  maxChildren: number,
  minNodesNumber: number,
  deep = 1,
  key = 'node'
): Tree[] => {
  let id = 0
  return Array.from({ length: minNodesNumber })
    .fill(deep)
    .map(() => {
      const childrenNumber = deep === maxDeep ? 0 : Math.round(Math.random() * maxChildren)
      const nodeKey = getKey(key, ++id)
      return {
        id: nodeKey,
        label: nodeKey,
        children: childrenNumber
          ? createData(maxDeep, maxChildren, childrenNumber, deep + 1, nodeKey)
          : undefined
      }
    })
}

const props = {
  value: 'id',
  label: 'label',
  children: 'children'
}
const data = createData(4, 4, 3)
console.log('data', data)
const originData = [
  `1016,节点,BUS1008,电压幅值1(kV),0`,
  `1017,节点,BUS1008,电压幅值2(kV),0`,
  `1018,节点,BUS1009,电压幅值1(kV),0`,
  `1019,节点,BUS1009,电压幅值2(kV),0`,
  `1020,发电机,GEN1000,有功出力1(MW),0`,
  `1021,发电机,GEN1000,无功出力2(MVar),1`,
  `1022,发电机,GEN1001,有功出力1(MW),0`,
  `1023,发电机,GEN1001,无功出力2(MVar),0`,
  `1024,发电机,GEN1002,有功出力1(MW),0`,
  `1025,发电机,GEN1002,无功出力2(MVar),0`
]
console.log('111', originData)
const resArr = [] as any[]
for (let i = 0; i < originData.length; i++) {
  const item = originData[i]
  const [circleId, firstNode, secondNode, leafNode, showFlag] = item.split(',')
  // console.log(item, 22222, circleId, firstNode, secondNode, leafNode, showFlag)
  const getFirstNode = resArr.find((firstItem) => firstItem.id === firstNode)
  // console.log(111, getFirstNode)
  if (getFirstNode === undefined) {
    const construcFirstObj = {
      id: firstNode,
      label: firstNode,
      children: [
        {
          id: secondNode,
          label: secondNode,
          children: [
            {
              id: circleId,
              label: `${leafNode}-${circleId}`
            }
          ]
        }
      ]
    }
    resArr.push(construcFirstObj)
  } else {
    const getSecondNode = getFirstNode.children.find((secondItem) => secondItem.id === secondNode)
    if (getSecondNode === undefined) {
      const construcSecondObj = {
        id: secondNode,
        label: secondNode,
        children: [
          {
            id: circleId,
            label: `${leafNode}-${circleId}`
          }
        ]
      }
      getFirstNode.children.push(construcSecondObj)
    } else {
      const construcLeafObj = {
        id: circleId,
        label: `${leafNode}-${circleId}`
      }
      getSecondNode.children.push(construcLeafObj)
    }
  }
}
console.log('resArr', resArr)
const myData = resArr
const myData1 = [
  {
    id: '节点',
    label: '节点',
    children: [
      {
        id: 'BUS1000',
        label: 'BUS1000',
        children: [
          { id: 1000, label: '电压幅值1(KV)' },
          { id: 1001, label: '电压幅值2(KV)' }
        ]
      },
      {
        id: 'BUS1001',
        label: 'BUS1001',
        children: [
          { id: 1002, label: '电压幅值1(KV)' },
          { id: 1003, label: '电压幅值2(KV)' }
        ]
      }
    ]
  },
  {
    id: '发电机',
    label: '发电机',
    children: [
      {
        id: 'GEN1000',
        label: 'GEN1000',
        children: [
          {
            id: '1020',
            label: '有功出力1(MW)'
          },
          {
            id: '1021',
            label: '无功出力2(MVar)'
          }
        ]
      }
    ]
  }
]
</script>
