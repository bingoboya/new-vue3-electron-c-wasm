import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
// import { setupStore } from '@renderer/store';

async function bootstrap(): Promise<void> {
  // const app = createApp(App)

  // Configure store
  // setupStore(app)


  createApp(App).use(createPinia()).mount('#app')

}



bootstrap()