<template lang="pug">
div
  p LinuxDo 信息：佬友 {{ commonStore.userInfo.linuxDoUsername }}，信任等级 {{ commonStore.userInfo.linuxDoTrustLevel }}
  p 毒奶粉用户名：{{ commonStore.userInfo.dnfUsername ?? '未注册' }}，绑定角色 {{ commonStore.userInfo.dnfBindCharacName ?? '未绑定' }}
  p
    a.text-blue-500(href="https://linux.do/t/topic/472401?u=cat73") 客户端下载引导

  n-button(type="info", @click="logout") 退出登录

  n-divider

  div.w-48
    template(v-if="commonStore.userInfo.dnfUsername")
      n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入新密码")
      n-button(type="info", @click="changeDnfPassword") 修改毒奶粉登录密码
    template(v-else)
      n-input(v-model:value="dnfaccount.username", placeholder="请输入账号")
      n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入密码")
      n-button(type="info", @click="registerDnfAccount") 创建毒奶粉账号
  p.text-xs.text-neutral-500 登录密码随时可在这里修改，受 DNF 数据库结构限制，只能传输 md5 值，无法使用更安全的 hash 方式，建议设一个和其他网站不一样的密码，反正忘了随时能改

  n-divider

  div.w-48
    n-select(v-model:value="dnfCharacId", :options="dnfCharacList")
    n-button(type="info", @click="bindDnfCharac") 绑定签到奖励领取角色

  n-divider

  p 签到配置：每天签到获得 {{ formatReward({ dailyReward: signInInfo.conf.dailyReward, minTrustLevel: 1 }) }}
  p(v-for="(cumulativeReward, day) in signInInfo.conf.cumulativeReward")
    span 本月累签 {{ day }} 天签到获得 {{ formatReward(cumulativeReward) }}
  p 本月已签 {{ signInInfo.signInDays.length }} 天
  n-button(type="info", @click="signIn") 签到领奖

</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  items: [],
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
      content: '如果不绑定角色，将只能领到点卷，无法领到道具，是否确认继续签到？',
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
    content: `本月已签到 ${ signInInfo.value.signInDays.length + 1 } 天`,
  })
  signInInfo.value = await fetchSignInInfo()
}

const formatReward = (reward) => {
  if (!reward || !reward.dailyReward) return ''

  let res = []
  
  if (reward.dailyReward.cash) {
    res.push(`${reward.dailyReward.cashDisplay ?? reward.dailyReward.cash} 点卷`)
  }
  if (reward.dailyReward.gold) {
    res.push(`${reward.dailyReward.gold} 金币`)
  }
  if (reward.dailyReward.items) {
    for (const id in reward.dailyReward.items) {
      const count = reward.dailyReward.items[id]
      res.push(`${count} 个${signInInfo.value.items[id]}`)
    }
  }

  return res.join('、') + (reward.minTrustLevel >= 3 ? '（三级佬友专享）' : '')
}

onMounted(async () => {
  signInInfo.value = await fetchSignInInfo()
  const characList = await fetchDnfCharacList()
  dnfCharacList.value = characList.map((item) => ({
    label: item.charac_name,
    value: item.charac_no,
  }))
})

</script>
