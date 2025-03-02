<template lang="pug">
div
  p LinuxDo 信息：佬友 {{ commonStore.userInfo.linuxDoUsername }}，信任等级 {{ commonStore.userInfo.linuxDoTrustLevel }}
  p 毒奶粉用户名：{{ commonStore.userInfo.dnfUsername ?? '未注册' }}，绑定角色 {{ commonStore.userInfo.dnfBindCharacName ?? '未绑定' }}
  p
    a.text-blue-500(href="https://linux.do/t/topic/458099/39?u=cat73") 客户端下载引导

  n-button(type="info", @click="logout") 退出登录

  n-divider

  div.w-48
    template(v-if="commonStore.userInfo.dnfUsername")
      n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入新密码")
      n-button(type="info", @click="changeDnfPassword") 修改毒奶粉登录密码
    template(v-else)
      n-input(v-model:value="dnfaccount.username", placeholder="请输入账号")
      n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入密码")
      n-button(type="info", @click="registerDnfAccount") 注册毒奶粉账号
  p.text-xs.text-neutral-500 登录密码随时可在这里修改，受 DNF 数据库结构限制，只能传输 md5 值，无法使用更安全的 hash 方式，建议设一个和其他网站不一样的密码，反正忘了随时能改

  n-divider

  div.w-48
    n-select(v-model:value="dnfCharacId", :options="dnfCharacList")
    n-button(type="info", @click="bindDnfCharac") 绑定签到奖励领取角色

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
import { useRouter } from 'vue-router'
import { doLogout, doRegisterDnfAccount, doChangeDnfPassword, fetchDnfCharacList, doBindDnfCharac, fetchSignInInfo, doSignIn } from '@/api'

const commonStore = useCommonStore()

const router = useRouter()

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
const dnfCharacList = ref([])
const dnfCharacId = ref(null)

const logout = async () => {
  await doLogout()
  router.push('/login')
}

const registerDnfAccount = async () => {
  await doRegisterDnfAccount({ dnfUsername: dnfaccount.value.username, dnfPassword: md5(dnfaccount.value.password) })
  await commonStore.fetchUserInfo()
  dnfaccount.value.username = ''
  dnfaccount.value.password = ''
  window.$message.success('注册成功')
}

const changeDnfPassword = async () => {
  await doChangeDnfPassword({ dnfPassword: md5(dnfaccount.value.password) })
  dnfaccount.value.password = ''
  window.$message.success('修改成功')
}

const bindDnfCharac = async () => {
  await doBindDnfCharac({ characNo: dnfCharacId.value })
  await commonStore.fetchUserInfo()
  window.$message.success('绑定成功')
}

const signIn = async () => {
  if (!commonStore.userInfo.dnfBindCharacName) {
    window.$dialog.warning({
      title: '您还没绑定角色',
      content: '如果不绑定角色，签到奖励只能领到点卷，无法领到道具，是否确认继续签到？',
      positiveText: '继续签到',
      negativeText: '放弃签到',
      onPositiveClick: async () => {
        window.$dialog.destroyAll()
        await confirmSignIn()
      },
    })
  } else {
    await confirmSignIn()
  }
}

const confirmSignIn = async () => {
  const res = await doSignIn()
  window.$dialog.success({
    title: '签到成功',
    content: `本次签到获得 ${res.dailyCash} 点卷${res.cumulativeCash ? `，已连续签到 ${res.cumulativeDays} 天，额外获得 ${res.cumulativeCash} 点卷` : ''}`,
  })
  signInInfo.value = await fetchSignInInfo()
}

onMounted(async () => {
  signInInfo.value = await fetchSignInInfo()
  const characList = await fetchDnfCharacList()
  dnfCharacList.value = characList.map((item) => ({
    label: item.charac_name,
    value: item.charac_no,
  }))
  console.log(dnfCharacList.value)
})

</script>
