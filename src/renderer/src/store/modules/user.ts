// import type { App } from 'vue';
// import { createPinia } from 'pinia';

// const store = createPinia();

// export function setupStore(app: App<Element>): void {
//   app.use(store);
// }

// export { store };

import { defineStore } from 'pinia'
export const userStore = defineStore('user', {
  state: () => {
    return {
      age: 18,
      firstname: 'Zheng'
    }
  },
  getters: {
    name(): string {
      console.log('getters')
      return this.firstname + ' Hongling'
    }
  },
  actions: {
    plusAge(val) {
      console.log('actions')
      this.age += val
    }
  }
})
