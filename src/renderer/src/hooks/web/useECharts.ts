import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useTimeoutFn } from '@renderer/hooks/core/useTimeout'
import { tryOnUnmounted } from '@vueuse/core'
import { unref, nextTick, watch, computed, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useEventListener } from '@renderer/hooks/event/useEventListener'
import { useBreakpoint } from '@renderer/hooks/event/useBreakpoint'
import echarts from '@renderer/utils/lib/echarts'

export function useECharts(
  elRef: Ref<HTMLDivElement>,
  theme: 'light' | 'dark' | 'default' = 'default'
) {
  const getDarkMode = computed(() => {
    return theme === 'default' ? 'light' : theme
  })
  let chartInstance: echarts.ECharts | null = null
  let resizeFn: Function = resize
  const cacheOptions = ref({}) as Ref<EChartsOption>
  let removeResizeFn: Function = () => {}

  resizeFn = useDebounceFn(resize, 200)

  const getOptions = computed(() => {
    if (getDarkMode.value !== 'dark') {
      return cacheOptions.value as EChartsOption
    }
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value
    } as EChartsOption
  })

  function initCharts(t = theme) {
    const el = unref(elRef)
    if (!el || !unref(el)) {
      return
    }
    const initChartsArgs: any = {
      renderer: 'canvas',
      useDirtyRect: true
    }
    chartInstance = echarts.init(el, t, initChartsArgs)

    const { removeEvent } = useEventListener({
      el: window,
      name: 'resize',
      listener: resizeFn
    })
    removeResizeFn = removeEvent
    const { widthRef, screenEnum } = useBreakpoint()
    if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
      useTimeoutFn(() => {
        resizeFn()
      }, 30)
    }
  }

  function setOptions(options: EChartsOption, clear = true) {
    const addDataZoomOptions = {
      // 默认设置成区域缩放的模式 配合下面的【默认选中区域缩放】设置
      toolbox: {
        top: 20,
        feature: {
          dataZoom: {
            // show: true,
          }
        }
      },
      dataZoom: {
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: false //鼠标滚轮不能触发缩放
      }
    }
    options = {
      ...options,
      ...addDataZoomOptions
    }

    cacheOptions.value = options
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions))
      }, 30)
      return
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts(getDarkMode.value as 'default')

          if (!chartInstance) return
        }
        clear && chartInstance?.clear()

        chartInstance?.setOption(unref(getOptions))
        chartInstance?.dispatchAction({
          show: true,
          // 默认选中区域缩放
          type: 'takeGlobalCursor',
          key: 'dataZoomSelect',
          // 启动或关闭 区域缩放
          dataZoomSelectActive: true // activate or inactivate
        })
      }, 30)
    })
  }

  function resize() {
    chartInstance?.resize()
  }

  function clearInstance() {
    chartInstance?.clear()
  }

  watch(
    () => getDarkMode.value,
    (theme) => {
      if (chartInstance) {
        chartInstance.dispose()
        initCharts(theme as 'default')
        setOptions(cacheOptions.value)
      }
    }
  )

  tryOnUnmounted(() => {
    if (!chartInstance) return
    removeResizeFn()
    chartInstance.dispose()
    chartInstance = null
  })

  function getInstance(): echarts.ECharts | null {
    console.log('getInstance----------')
    if (!chartInstance) {
      initCharts(getDarkMode.value as 'default')
    }
    return chartInstance
  }

  const getModeloptions: any = () => {
    return chartInstance?.getOption()
  }

  const legendSelectAction: any = (val) => {
    console.log('选中图例', val)
    chartInstance?.dispatchAction({
      type: 'legendSelect',
      name: val
    })
  }
  const legendUnSelectAction: any = (val) => {
    console.log('取消选中图例', val)
    chartInstance?.dispatchAction({
      type: 'legendUnSelect',
      name: val
    })
  }

  return {
    setOptions,
    resize,
    clearInstance,
    echarts,
    getInstance,
    legendSelectAction,
    legendUnSelectAction,
    getModeloptions
  }
}
