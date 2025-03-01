import { defineStore } from 'pinia'
import { fetchUserInfo } from '@/api'

const useCommonStore = defineStore('base', {
  state: () => ({
    // 当前用户信息
    userInfo: {
      id: null,
      dnfUsername: null,
      linuxDoName: null,
      linuxDoUsername: null,
      linuxDoTrustLevel: null,
    },
  }),
  actions: {
    async fetchUserInfo() {
      const userInfo = await fetchUserInfo()
      this.userInfo = userInfo
    },
  }
})

export default useCommonStore