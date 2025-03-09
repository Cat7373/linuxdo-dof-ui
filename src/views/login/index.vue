<template lang="pug">
.p-2(v-if="ready")
  n-card(title="LinuxDo 毒奶粉公益服", size="small")
    n-button(type="info", @click="linuxDoLogin") LinuxDo 登陆
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCommonStore } from '@/store'
import { fetchLinuxDoLoginUrl, doLinuxDoLogin } from '@/api'

const commonStore = useCommonStore()

const route = useRoute()
const router = useRouter()

const ready = ref(false)

// 登陆
const linuxDoLogin = async () => {
  const res = await fetchLinuxDoLoginUrl()
  window.location.href = res
}

onMounted(async () => {
  const { code, state } = route.query
  try {
    if (code && state) { // 处理 LinuxDo 登陆回调
      await doLinuxDoLogin({ code, state })
      await commonStore.fetchUserInfo()
      await router.push('/home')
    }
  } finally {
    ready.value = true
  }
})
</script>

<style lang="scss" scoped>
</style>
