<template lang="pug">
.px-8.py-6.space-y-8
  //- L 站账号
  n-card
    n-flex(justify="space-between")
      div
        p.text-2xl 下午好，{{ commonStore.userInfo.linuxDoUsername }}
        p.text-neutral-500 信任等级：{{ commonStore.userInfo.linuxDoTrustLevel }} 级
      
      n-button(strong, size="large", :bordered="false", @click="logout")
        template(#icon)
          n-icon(size="40")
            LogOutOutline

  //- 游戏账号
  n-grid(x-gap="10", y-gap="10", cols="1 600:2")
    //- 注册 + 修改密码
    n-gi
      n-card.h-full(title="游戏账号")
        n-form(v-if="!commonStore.userInfo.dnfUsername", inline, label-placement="left", label-width="auto")
          n-form-item(label="账号")
            n-input(v-model:value="dnfaccount.username", placeholder="请输入账号")
          n-form-item(label="密码")
            n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入密码")
          n-form-item
            n-button(type="info", @click="registerDnfAccount") 注册游戏账号
        n-form(v-else, inline, label-placement="left", label-width="auto")
          n-form-item(label="密码")
            n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入密码")
          n-form-item
            n-button(type="info", @click="changeDnfPassword") 修改游戏密码

        //- 提示区
        .text-neutral-500
          p(v-if="!commonStore.userInfo.dnfUsername") * 您需要先注册账号，然后下载客户端后，使用注册的账号登录游戏，不用担心忘记密码，注册后随时可以修改
          p(v-else) * 您已注册游戏账号 {{ commonStore.userInfo.dnfUsername }}，如果忘记密码，可在此修改
        p
          span.text-neutral-500 *&nbsp;
          a.text-blue-500(href="https://linux.do/t/topic/472401?u=cat73") 客户端下载、服务器介绍及 FAQ

    //- 角色绑定
    n-gi
      n-card.h-full(v-if="commonStore.userInfo.dnfUsername", title="角色绑定")
        n-form(inline, label-placement="left", label-width="auto")
          n-form-item(label="选择角色")
            n-select.w-48(v-model:value="dnfCharacId", :options="dnfCharacList")
          n-form-item
            n-button(type="info", @click="bindDnfCharac") 绑定角色
        
        .text-neutral-500
          p(v-if="commonStore.userInfo.dnfBindCharacName") * 您已绑定游戏角色 {{ commonStore.userInfo.dnfBindCharacName }}
          p(v-else) * 您还没绑定游戏角色
          p * 每日签到、积分兑换获得的物品会发送给绑定的角色

  //- 每日签到
  n-card(v-if="commonStore.userInfo.dnfUsername", title="每日签到")
    n-tabs(class="card-tabs", default-value="signin", animated)
      n-tab-pane(name="signin", tab="签到")
        n-calendar(:default-value="now", :is-date-disabled="t => !dayjs(t).isSame(dayjs(), 'month')", #="{ month, date }", style="height: 500px;")
          p(:style="{ color: qiandaoColor(month, date) }") {{ qiandaoStatus(month, date) }}
        
        .text-neutral-500
          p * 本月已签到 {{ signInInfo.signInDays.length }} 天

        n-button.w-full.mt-8(v-if="signInInfo.signInDays.includes(new Date().getDate())", type="info", disabled) 今日已签到
        n-button.w-full.mt-8(v-else, type="info", @click="signIn") 签到
      n-tab-pane(name="reward", tab="说明")
        .text-sm
          p.text-neutral-500 每日礼品：{{ formatReward({ reward: signInInfo.conf.dailyReward, minTrustLevel: 1 }) }}
          p &nbsp;
          template(v-for="(monthReward, day) in signInInfo.conf.monthReward")
            p.text-neutral-500(v-if="commonStore.userInfo.linuxDoTrustLevel >= monthReward.minTrustLevel") 累签 {{ day }} 天礼品：{{ formatReward(monthReward) }}
            p.text-neutral-200(v-else) 累签 {{ day }} 天礼品：{{ formatReward(monthReward) }}

  //- 积分兑换
  //- n-card(v-if="commonStore.userInfo.dnfUsername", title="积分兑换")

</template>

<script setup>
import { ref, onMounted } from 'vue'
import md5 from 'md5'
import dayjs from 'dayjs'
import { useCommonStore } from '@/store'
import { useRouter } from 'vue-router'
import { doLogout, doRegisterDnfAccount, doChangeDnfPassword, fetchDnfCharacList, doBindDnfCharac, fetchSignInInfo, doSignIn } from '@/api'
import { LogOutOutline } from '@vicons/ionicons5'

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
  if (!reward || !reward.reward) return ''

  let res = []
  
  if (reward.reward.cash) {
    res.push(`${reward.reward.cashDisplay ?? reward.reward.cash} 点卷`)
  }
  if (reward.reward.gold) {
    res.push(`${reward.reward.gold} 金币`)
  }
  if (reward.reward.point) {
    res.push(`${reward.reward.point} 积分`)
  }
  if (reward.reward.items) {
    for (const id in reward.reward.items) {
      const count = reward.reward.items[id]
      res.push(`${count} 个${signInInfo.value.items[id]}`)
    }
  }

  return res.join('、') + (reward.minTrustLevel >= 3 ? '（三级佬友专享）' : '')
}

const qiandaoColor = (m, d) => {
  const nowMonth = ((new Date()).getMonth() + 1)
  const nowDate = (new Date()).getDate()
  const isCheck = signInInfo.value.signInDays.includes(d)

  if (m != nowMonth) return '#000'
  if (isCheck) return '#84cc16'
  if (nowDate > d) return '#ef4444'
  return '#000'
}
const qiandaoStatus = (m, d) => {
  const nowMonth = ((new Date()).getMonth() + 1)
  const nowDate = (new Date()).getDate()
  const isCheck = signInInfo.value.signInDays.includes(d)

  if (m != nowMonth) return ''
  if (isCheck) return '√'
  if (nowDate > d) return 'X'
  return ''
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

<style lang="scss" scoped>
:deep(.n-calendar-header__extra > .n-button-group) {
  display: none;
}
</style>
