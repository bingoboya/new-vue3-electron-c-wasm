import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { useTimeoutFn } from '@renderer/hooks/core/useTimeout'
import { tryOnUnmounted, useDebounceFn } from '@vueuse/core'
import { unref, nextTick, watch, computed, ref } from 'vue'
import { useEventListener } from '@renderer/hooks/event/useEventListener'
import { useBreakpoint } from '@renderer/hooks/event/useBreakpoint'
import echarts from '@renderer/utils/lib/echarts'

export function useECharts(
  elRef: Ref<HTMLDivElement>,
  theme: 'light' | 'dark' | 'default' = 'default'
) {
  // const getDarkMode = computed(() => {
  //   return theme === 'default' ? 'light' : theme
  // })
  let chartInstance: echarts.ECharts | null = null
  let resizeFn: Function = resize
  // const cacheOptions = ref({}) as Ref<EChartsOption>
  let removeResizeFn: Function = () => {}

  resizeFn = useDebounceFn(resize, 200)

  // const getOptions = computed(() => {
  //   if (getDarkMode.value !== 'dark') {
  //     return cacheOptions.value as EChartsOption
  //   }
  //   return {
  //     backgroundColor: 'transparent',
  //     ...cacheOptions.value
  //   } as EChartsOption
  // })

  function initCharts(t = theme) {
    const el = unref(elRef)
    if (!el || !unref(el)) {
      return
    }
    // const initChartsArgs: any = {
    //   renderer: 'canvas',
    //   useDirtyRect: true
    // }
    chartInstance = echarts.init(el, t, {
      // renderer: 'svg',
      renderer: 'canvas',
      useDirtyRect: true
    })

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

  function setOptions(
    options: EChartsOption,
    clear = true,
    replaceMergeOption = [],
    setZoom = false
  ) {
    // const addDataZoomOptions = {
    // 默认设置成区域缩放的模式 配合下面的【默认选中区域缩放】设置
    // dataZoom: {
    //   type: 'inside',
    //   xAxisIndex: 0,
    //   zoomOnMouseWheel: false //鼠标滚轮不能触发缩放
    // }
    // dataZoom: [
    //   {
    //     type: 'inside',
    //     start: 0,
    //     end: 10,
    //     zoomOnMouseWheel: false //设置鼠标滚轮不能触发缩放
    //   },
    //   {
    //     start: 0,
    //     end: 10
    //   }
    // ]
    // }
    // options = {
    //   ...options,
    //   ...addDataZoomOptions
    // }
    // cacheOptions.value = options
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(options)
      }, 30)
      return
    }
    nextTick(() => {
      // useTimeoutFn(() => {
      if (!chartInstance) {
        initCharts('light')
        // initCharts(getDarkMode.value as 'default')
        if (!chartInstance) return
      }
      clear && chartInstance?.clear()

      chartInstance?.setOption(options, {
        // 在设置完 option 后是否不立即更新图表，默认为 false，即同步立即更新。如果为 true，则会在下一个 animation frame 中，才更新图表。
        lazyUpdate: true,
        // ['series'] 这个配置在删除图中的某条线时，只更新series数据
        replaceMerge: replaceMergeOption
        // replaceMerge: ['series']
      })
      // 只在initCharts时设置一次
      setZoom && setToolBoxZoomActive()
      // }, 30)
    })
  }

  function resize() {
    chartInstance?.resize()
  }

  function clearInstance() {
    // console.log('------clearInstance')
    chartInstance?.clear()
  }

  // watch(
  //   () => getDarkMode.value,
  //   (theme) => {
  //     if (chartInstance) {
  //       chartInstance.dispose()
  //       initCharts(theme as 'default')
  //       setOptions(cacheOptions.value)
  //     }
  //   }
  // )

  tryOnUnmounted(() => {
    if (!chartInstance) return
    removeResizeFn()
    chartInstance.dispose()
    chartInstance = null
  })

  function getInstance(): echarts.ECharts | null {
    // console.log('getInstance----------')
    if (!chartInstance) {
      initCharts('light')
      // initCharts(getDarkMode.value as 'default')
    }
    return chartInstance
  }

  const legendSelectAction: any = (val) => {
    console.log('选中图例', val)
    chartInstance?.dispatchAction({
      type: 'legendSelect',
      name: val
    })
  }
  const legendUnSelectAction: any = (nameAndIndex) => {
    console.log('取消选中图例', nameAndIndex)
    chartInstance?.dispatchAction({
      type: 'legendUnSelect',
      name: nameAndIndex
    })
  }

  const setToolBoxZoomActive: any = () => {
    // chartInstance?.dispatchAction({
    //   show: true,
    //   // 默认开启选中区域缩放
    //   type: 'takeGlobalCursor',
    //   key: 'dataZoomSelect',
    //   // 启动或关闭 toolbox中的区域缩放功能
    //   dataZoomSelectActive: true // activate or inactivate
    // })
  }

  // const getModeloptions: any = () => {
  //   return chartInstance?.getOption()
  // }

  return {
    setOptions,
    clearInstance,
    getInstance,
    legendSelectAction,
    legendUnSelectAction
    // resize,
    // echarts,
    // getModeloptions
  }
}
