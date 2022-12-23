<script lang="tsx">
import {
  defineComponent,
  computed,
  ref,
  unref,
  reactive,
  onMounted,
  watch,
  nextTick,
  CSSProperties,
  PropType
} from 'vue'
import { useEventListener } from '@renderer/hooks/event/useEventListener'
import { getSlot } from '@renderer/utils/helper/tsxHelper'
import { useDragStore } from '@renderer/store/modules/userDraggable'

type NumberOrNumberString = PropType<string | number | undefined>

const props = {
  height: [Number, String] as NumberOrNumberString,
  maxHeight: [Number, String] as NumberOrNumberString,
  maxWidth: [Number, String] as NumberOrNumberString,
  minHeight: [Number, String] as NumberOrNumberString,
  minWidth: [Number, String] as NumberOrNumberString,
  width: [Number, String] as NumberOrNumberString,
  bench: {
    type: [Number, String] as NumberOrNumberString,
    default: 0
  },
  itemHeight: {
    type: [Number, String] as NumberOrNumberString,
    required: true
  },
  items: {
    type: Array as PropType<any[]>,
    default: (): any => []
  }
}


function convertToUnit(str: string | number | null | undefined, unit = 'px'): string | undefined {
  if (str == null || str === '') {
    return undefined
  } else if (isNaN(+str!)) {
    return String(str)
  } else {
    return `${Number(str)}${unit}`
  }
}

export default defineComponent({
  name: 'VirtualScroll',
  props,
  setup(props, { slots }) {
    const wrapElRef = ref<HTMLDivElement | null>(null)
    const state = reactive({
      first: 0,
      last: 0,
      scrollTop: 0
    })

    const getBenchRef = computed(() => {
      return parseInt(props.bench as string, 10)
    })

    const getItemHeightRef = computed(() => {
      return parseInt(props.itemHeight as string, 10)
    })

    const getFirstToRenderRef = computed(() => {
      return Math.max(0, state.first - unref(getBenchRef))
    })

    const getLastToRenderRef = computed(() => {
      return Math.min((props.items || []).length, state.last + unref(getBenchRef))
    })

    const getContainerStyleRef = computed((): CSSProperties => {
      return {
        height: convertToUnit((props.items || []).length * unref(getItemHeightRef))
      }
    })

    const getWrapStyleRef = computed((): CSSProperties => {
      const styles: any = {}
      const height = convertToUnit(props.height)
      const minHeight = convertToUnit(props.minHeight)
      const minWidth = convertToUnit(props.minWidth)
      const maxHeight = convertToUnit(props.maxHeight)
      const maxWidth = convertToUnit(props.maxWidth)
      const width = convertToUnit(props.width)

      if (height) styles.height = height
      if (minHeight) styles.minHeight = minHeight
      if (minWidth) styles.minWidth = minWidth
      if (maxHeight) styles.maxHeight = maxHeight
      if (maxWidth) styles.maxWidth = maxWidth
      if (width) styles.width = width
      return styles
    })

    watch([(): any => props.itemHeight, (): any => props.height], () => {
      onScroll()
    })

    function getLast(first: number): number {
      const wrapEl = unref(wrapElRef)
      if (!wrapEl) {
        return 0
      }
      const height = parseInt((props.height || 0).toString(), 10) || wrapEl.clientHeight

      return first + Math.ceil(height / unref(getItemHeightRef))
    }

    function getFirst(): number {
      return Math.floor(state.scrollTop / unref(getItemHeightRef))
    }

    function onScroll(): any {
      const wrapEl = unref(wrapElRef)
      if (!wrapEl) {
        return
      }
      state.scrollTop = wrapEl.scrollTop
      state.first = getFirst()
      state.last = getLast(state.first)
    }

    function renderChildren(): any {
      const { items = [] } = props
      return items.slice(unref(getFirstToRenderRef), unref(getLastToRenderRef)).map(genChild)
    }

    const dragstart = (e, item, index): any => {
      const { title } = item
      e.dataTransfer.clearData()
      e.dataTransfer.setData('text', `${index},${title}`)
      // console.log('dragstart--------', e, e.dataTransfer.getData('text'), item, index);
    }
    const userDragStore = useDragStore()

    const dragend = (e, item, index): any => {
      console.log('dragend--------', e, item, index);
    }
    // const dragover = (e, item, index): any => {
    //   // console.log('dragover--------', e, item, index);
    // }
    function genChild(item: any, index: number): any {
      index += unref(getFirstToRenderRef)
      const onDragstart = (e): any => {
        dragstart(e, item, index)
      }
      const onDragend = (e): any => {
        dragend(e, item, index)
      }
      const onDragover = (e): any => {
        e.preventDefault()
        // dragover(e, item, index);
      }
      // console.log('getItemHeightRef', unref(getItemHeightRef))
      const top = convertToUnit(index * unref(getItemHeightRef))
      return (
        <div
          draggable
          onDragstart={onDragstart}
          onDragend={onDragend}
          onDragover={onDragover}
          data-index={index}
          class={`virtual-scroll__item`}
          style={{ top }}
          key={index}
        >
          {getSlot(slots, 'default', { index, item })}
        </div>
      )
    }

    onMounted(() => {
      state.last = getLast(0)
      nextTick(() => {
        const wrapEl = unref(wrapElRef)
        if (!wrapEl) {
          return
        }
        useEventListener({
          el: wrapEl,
          name: 'scroll',
          listener: onScroll,
          wait: 0
        })
      })
    })

    return (): any => (
      <div class="virtual-scroll" style={unref(getWrapStyleRef)} ref={wrapElRef}>
        <div class="virtual-scroll__container" style={unref(getContainerStyleRef)}>
          {renderChildren()}
        </div>
      </div>
    )
  }
})
</script>
<style scoped lang="less">
.virtual-scroll__container {
  display: flex !important;
}
.virtual-scroll__item {
  position: absolute;
  right: 0;
  left: 0;
}
.virtual-scroll {
  position: relative;
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: auto;
  flex: 1 1 auto;
}
.virtual-scroll__container {
  display: block;
}
</style>
