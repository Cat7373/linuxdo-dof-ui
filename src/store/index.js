import { createPinia } from 'pinia'
import useCommonStore from './modules/common'

const pinia = createPinia()

const loadBaseData = async ({ userInfo }={}) => {
  // 更新当前登陆的用户信息
  if (userInfo) {
    useCommonStore().userInfo = userInfo
  } else {
    await useCommonStore().fetchUserInfo()
  }
}

export { loadBaseData, useCommonStore }
export default pinia