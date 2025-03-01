import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'

import 'vfonts/Lato.css'
import '@/assets/styles/global.css'

window._AMapSecurityConfig = {
  securityJsCode: '62dce6e6ab23bb0378c723b18c1673ec',
}

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')

