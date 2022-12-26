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
    const dragstart = (e, label, index): any => {
      e.dataTransfer.clearData()
      e.dataTransfer.setData('text', `${index},${label}`)
      console.log('dragstart--------', e, e.dataTransfer.getData('text'), label, index)
    }
    // const dragend = (e, item, index): any => { console.log('dragend--------', e, item, index) }
    // const dragover = (e, item, index): any => { console.log('dragover--------', e, item, index); }

    function genChildNode(node: any): any {
      const onDragstart = (e): any => {
        const {
          label,
          data: { id }
        } = node
        dragstart(e, label, id)
      }
      const onDragend = (_e): any => {
        // dragend(e, item, index)
      }
      const onDragover = (_e): any => {
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
    return (): any => <div>{genChildNode(props.treeNode)}</div>
  }
})
</script>