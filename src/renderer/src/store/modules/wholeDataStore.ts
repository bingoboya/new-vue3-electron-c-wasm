import { defineStore } from 'pinia'
export const wholeCircleDataStore = defineStore({
  id: 'whole-circle-data',
  state: () => ({
    wholeCircleDataListStore: new Map()
  }),
  getters: {
    getWholeCircleDataListStore(): any {
      return this.wholeCircleDataListStore
    }
  },
  actions: {
    async setWholeCircleDataStore(values) {
      values.forEach((val) => {
        const getValue = this.wholeCircleDataListStore.get(val.id)
        if (getValue === undefined) {
          this.wholeCircleDataListStore.set(val.id, [val.value])
        } else {
          getValue.push(val.value)
        }
      })
    }
  }
})
