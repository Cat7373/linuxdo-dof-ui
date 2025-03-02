<template lang="pug">
div
  p LinuxDo 信息：佬友 {{ commonStore.userInfo.linuxDoUsername }}，信任等级 {{ commonStore.userInfo.linuxDoTrustLevel }}
  p 毒奶粉用户名：{{ commonStore.userInfo.dnfUsername ?? '未注册' }}
  p
    a.text-blue-500(href="https://linux.do/t/topic/458099/39?u=cat73") 客户端下载引导

  n-button(type="info", @click="logout") 退出登录

  n-divider

  div.w-48
    template(v-if="commonStore.userInfo.dnfUsername")
      n-input(v-model:value="dnfaccount.password")
      n-button(type="info", @click="changeDnfPassword") 修改毒奶粉登录密码
    template(v-else)
      n-input(v-model:value="dnfaccount.username")
      n-input(v-model:value="dnfaccount.password")
      n-button(type="info", @click="registerDnfAccount") 注册毒奶粉账号
  
  n-divider

  p 签到配置：每天签到奖励 {{ signInInfo.conf.dailyCash }} 点卷
  p(v-for="(cumulativeCash, day) in signInInfo.conf.cumulativeCash")
    span 本月累签 {{ day }} 天签到奖励 {{ cumulativeCash[1] }} 点卷
    span(v-if="cumulativeCash[2] == 3") &nbsp;(3 级佬友专享)
  p 本月签到天数: {{ signInInfo.signInDays.length }}
  n-button(type="info", @click="signIn") 签到领奖

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import md5 from 'md5'
import { useCommonStore } from '@/store'
import { doLogout, doRegisterDnfAccount, doChangeDnfPassword, fetchSignInInfo, doSignIn } from '@/api'

const commonStore = useCommonStore()

const dnfaccount = ref({
  username: '',
  password: '',
})
const signInInfo = ref({
  conf: {
    dailyCash: 0,
    cumulativeCash: {},
  },
  signInDays: [],
})

const logout = async () => {
  await doLogout()
  router.push('/login')
}

const registerDnfAccount = async () => {
  await doRegisterDnfAccount({ dnfUsername: dnfaccount.value.username, dnfPassword: md5(dnfaccount.value.password) })
  await commonStore.fetchUserInfo()
  window.$message.success('注册成功')
}

const changeDnfPassword = async () => {
  await doChangeDnfPassword({ dnfPassword: md5(dnfaccount.value.password) })
  window.$message.success('修改成功')
}

const signIn = async () => {
  const res = await doSignIn()
  window.$dialog.success({
    title: '签到成功',
    content: `本次签到获得 ${res.dailyCash} 点卷${res.cumulativeCash ? `，已连续签到 ${res.cumulativeDays} 天，额外获得 ${res.cumulativeCash} 点卷` : ''}`,
  })
}

onMounted(async () => {
  const res = await fetchSignInInfo()
  signInInfo.value = res
})

</script>
