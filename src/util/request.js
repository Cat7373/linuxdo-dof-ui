import axios from 'axios'
import route from '@/router'
import { useCommonStore } from '@/store'

const instance = axios.create({
  timeout: 30 * 1000,
  baseURL: '', // 请勿修改
  headers: {
    'Content-Type': 'application/json'
  }
})

// 对服务器响应的失败做公共拦截
let loginTimeoutLock = 0
instance.interceptors.response.use(response => {
  const respCode = response.data.code

  if (respCode < 0) {
    let showMessage = true

    if (respCode == -2) { // 跳转到登陆页
      useCommonStore().$reset()

      // 弹出一次后，锁定 3s 不再弹出
      if (Date.now() > loginTimeoutLock) {
        loginTimeoutLock = Date.now() + 3000
      } else {
        showMessage = false
      }
      // 如果已经在登陆页了，不要弹出提示
      if (route.currentRoute.value.name == 'Login') {
        showMessage = false
      } else {
        route.push('/login')
      }
    }

    if (showMessage) {
      window.$message.warning(response.data.message || '接口请求失败，请稍后重试', { duration: 6666 })
    }
    return Promise.reject(response) // 拒绝时，给完整响应
  }

  return response.data.data // 成功时，直接把数据部分回给调用方
}, error => { // 服务器不应响应 200 之外的情况，主要处理 502 这种特殊情况
  window.$message.warning('接口请求失败，请稍后重试')
  return Promise.reject(error)
})

export default instance