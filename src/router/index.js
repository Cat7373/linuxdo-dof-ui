import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { Home as HomeIcon } from '@vicons/fa'

export const routes = [
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true,
  }, {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true,
  },

  // 首页
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{
      name: 'Home',
      path: '/home',
      component: () => import('@/views/home/index.vue'),
      meta: { title: '首页', icon: HomeIcon },
    }],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

router.beforeEach((guard) => {
  if (!router.hasRoute(guard.name)) {
    router.push({ name: '404' })
  }
})

export default router