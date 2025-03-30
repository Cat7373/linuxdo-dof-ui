<template lang="pug">
.h-screen.w-screen
  .w-96.mx-auto.pt-16(v-if="ready")
    n-card.text-center
      p.text-2xl
        a(href="https://linux.do/t/topic/472401?u=cat73") LinuxDo 毒奶粉公益服
      n-button.w-full.mt-8(type="info", @click="linuxDoLogin") LinuxDo 登陆
  n-flex(v-else, justify="center").mt-52
    div
      n-flex(justify="center")
        n-spin(size="large")
      p 正在登录，请稍等...
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
