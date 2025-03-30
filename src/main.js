import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'

import 'vfonts/Lato.css'
import '@/assets/styles/global.css'

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')
