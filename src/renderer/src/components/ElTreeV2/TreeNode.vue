<script lang="tsx">
import { onMounted, defineComponent } from 'vue'
// import { useDragStore } from '@renderer/store/modules/userDraggable'

const props = {
  treeNode: {
    type: Object,
    default: (): any => {}
  }
}
export default defineComponent({
  name: 'TreeNode',
  props,
  setup(props, { slots }) {
    // console.log('props.treeNode as Object', props.treeNode as Object)

    const dragstart = (e, label, index): any => {
      // const { title } = item
      e.dataTransfer.clearData()
      e.dataTransfer.setData('text', `${index},${label}`)
      console.log('dragstart--------', e, e.dataTransfer.getData('text'), label, index)
    }
    // const dragend = (e, item, index): any => {
    //   console.log('dragend--------', e, item, index)
    // }
    // const dragover = (e, item, index): any => {
    //   // console.log('dragover--------', e, item, index);
    // }

    function genChildNode(node: any): any {
      const onDragstart = (e): any => {
        const {
          label,
          data: { id }
        } = node
        // console.log('e------', e, node, label, id)
        dragstart(e, label, id)
      }
      const onDragend = (e): any => {
        // dragend(e, item, index)
      }
      const onDragover = (e): any => {
        // e.preventDefault()
        // dragover(e, item, index);
      }
      return (
        <div
          draggable={node.isLeaf}
          onDragstart={onDragstart}
          onDragend={onDragend}
          onDragover={onDragover}
        >
          {/* data-index={index} key={index} */}
          {node.label}
        </div>
      )
    }
    onMounted(() => {
      // state.last = getLast(0)
      // nextTick(() => {
      //   const wrapEl = unref(wrapElRef)
      //   if (!wrapEl) {
      //     return
      //   }
      // })
    })

    return (): any => <div>{genChildNode(props.treeNode)}</div>
  }
})
</script>
<style scoped lang="less">

</style>
