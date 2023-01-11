<script lang="tsx">
import { defineComponent } from 'vue'
const props = {
  treeNode: {
    type: Object,
    default: (): any => {}
  }
}
export default defineComponent({
  name: 'TreeNode',
  props,
  setup(props) {
    // console.log('props.treeNode as Object', props.treeNode as Object)
    const dragstart = (e, label, index, firstNode, secondNode): any => {
      e.dataTransfer.clearData()
      const obj = { label, index, firstNode, secondNode }
      e.dataTransfer.setData('text', JSON.stringify(obj))
      // e.dataTransfer.setData('text', `${index},${label},${firstNode},${secondNode}`)
      console.log('drag-start--------', e, e.dataTransfer.getData('text'), label, index)
    }
    // const dragend = (e, item, index): any => { console.log('dragend--------', e, item, index) }
    // const dragover = (e, item, index): any => { console.log('dragover--------', e, item, index); }

    function genChildNode(node: any): any {
      const onDragstart = (e): any => {
        console.log('node', node)
        const {
          data: { id, firstNode, secondNode, label }
        } = node
        dragstart(e, label, id, firstNode, secondNode)
      }
      const onDragend = (_e): any => {
        // dragend(e, item, index)
      }
      const onDragover = (e): any => {
        e.preventDefault()
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
    return (): any => <div>{genChildNode(props.treeNode)}</div>
  }
})
</script>