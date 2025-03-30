<template lang="pug">
.px-8.py-6.space-y-8.bg-neutral-50
  //- L 站账号
  n-card(size="small")
    n-flex(justify="space-between")
      div
        p.text-2xl 下午好，{{ commonStore.userInfo.linuxDoTrustLevel }} 级佬友 {{ commonStore.userInfo.linuxDoUsername }}

      n-button(strong, size="large", :bordered="false", @click="logout")
        template(#icon)
          n-icon(size="40")
            LogoutIcon

  n-grid(x-gap="10", y-gap="10", cols="1 600:2")
    //- 游戏账号
    n-gi
      n-card.h-full(size="small", title="游戏账号")
        //- 注册 + 修改密码
        n-form(v-if="!commonStore.userInfo.dnfUsername", inline, label-placement="left", label-width="auto")
          n-form-item(label="账号")
            n-input(v-model:value="dnfaccount.username", placeholder="请输入账号")
          n-form-item(label="密码")
            n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入密码")
          n-form-item
            n-button(type="info", @click="registerDnfAccount") 注册游戏账号
        n-form(v-else, inline, label-placement="left", label-width="auto")
          n-form-item(label="密码")
            n-input(v-model:value="dnfaccount.password", type="password", placeholder="请输入新密码")
          n-form-item
            n-button(type="info", @click="changeDnfPassword") 修改游戏密码

        //- 提示区
        .text-neutral-500
          p(v-if="!commonStore.userInfo.dnfUsername") * 您需要下载客户端后，使用注册的账号登录游戏，不用担心忘记密码，注册后随时可修改
          p(v-else) * 您已注册游戏账号 {{ commonStore.userInfo.dnfUsername }}，如果忘记密码，可在此修改
        p
          span.text-neutral-500 *&nbsp;
          a.text-blue-500(href="https://linux.do/t/topic/472401?u=cat73") 客户端下载、服务器介绍、FAQ 及讨论区

    //- 角色绑定
    n-gi
      n-card.h-full(v-if="commonStore.userInfo.dnfUsername", size="small", title="角色绑定")
        //- 角色绑定
        n-form(inline, label-placement="left", label-width="auto")
          n-form-item(label="选择角色")
            n-select.w-48(v-model:value="dnfCharacId", :options="dnfCharacList")
          n-form-item
            n-button(type="info", @click="bindDnfCharac") 绑定角色

        //- 提示区
        .text-neutral-500
          p(v-if="commonStore.userInfo.dnfBindCharacName") * 您已绑定游戏角色 {{ commonStore.userInfo.dnfBindCharacName }}
          p(v-else) * 您还没绑定游戏角色
          p * 每日签到、积分兑换获得的物品会发送给绑定的角色

  //- 每日签到
  n-card(v-if="commonStore.userInfo.dnfUsername", size="small", title="每日签到")
    n-tabs(class="card-tabs", default-value="signin", animated)
      //- 签到页
      n-tab-pane(name="signin", tab="签到")
        n-calendar(:default-value="now", :is-date-disabled="t => !dayjs(t).isSame(dayjs(), 'month')", #="{ month, date }", style="height: 500px;")
          p(:style="{ color: qiandaoColor(month, date) }") {{ qiandaoStatus(month, date) }}

        .text-neutral-500
          p * 本月已签到 {{ signInInfo.signInDays.length }} 天

        n-button.w-full.mt-8(v-if="signInInfo.signInDays.includes(new Date().getDate())", type="info", disabled) 今日已签到
        n-button.w-full.mt-8(v-else, type="info", @click="signIn") 签到

      //- 说明页
      n-tab-pane(name="reward", tab="说明")
        .text-sm
          p.text-neutral-500 每日礼品：{{ formatReward({ reward: signInInfo.conf.dailyReward, minTrustLevel: 1 }) }}
          p &nbsp;
          template(v-for="(monthReward, day) in signInInfo.conf.monthReward")
            p.text-neutral-500(v-if="commonStore.userInfo.linuxDoTrustLevel >= monthReward.minTrustLevel") 累签 {{ day }} 天礼品：{{ formatReward(monthReward) }}
            p.text-neutral-200(v-else) 累签 {{ day }} 天礼品：{{ formatReward(monthReward) }}

  //- 积分兑换
  n-card(v-if="commonStore.userInfo.dnfUsername", size="small", :title="`积分兑换 - 剩余 ${ commonStore.userInfo.pointBalance } 积分`")
    n-tabs(v-if="fuliduihuan.defaultTab", class="card-tabs", :default-value="fuliduihuan.defaultTab", animated)
      //- 商品分类
      n-tab-pane(v-for="category in fuliduihuan.categorys", :key="category.id", :name="category.id", :tab="category.name")
        n-grid(x-gap="10", y-gap="10", cols="2 900:4 1800:6")
          //- 商品
          template(v-for="good in category.goods", :key="good.id")
            n-gi.border.rounded.p-2
              n-flex(justify="space-between")
                .info
                  p.text-sm {{ good.name }}
                  p.text-xs.text-neutral-500
                    span {{ good.price }} 积分
                    span(v-if="good.limit < 99999999") ，限购: {{ good.todayCount }}/{{ good.limit }}

                //- 兑换按钮及弹窗
                n-popover(trigger="hover", @update:show="() => fuliduihuan.count = 1", :ref="el => saveRef(el, 'fuliduihuan', good.id)")
                  template(#trigger)
                    n-button 兑换

                  n-input-group
                    n-input-number(v-model:value="fuliduihuan.count", :precision="0", :min="1", :max="good.limit - good.todayCount", placeholder="数量")
                      template(#suffix) 个
                    n-button(type="primary", @click="buyFuLiDuiHuan(good.id)")
                      template(#icon)
                        CheckIcon

      //- TODO 许愿页
      n-tab-pane(name="wish", tab="许愿")
        p
          span 许愿池施工中喵，请先至
          a.text-blue-500(href="https://linux.do/t/topic/472401?u=cat73") 论坛回帖
          span 许愿喵...
</template>

<script setup>
import { ref, onMounted } from 'vue'
import md5 from 'md5'
import dayjs from 'dayjs'
import { useCommonStore } from '@/store'
import { useRouter } from 'vue-router'
import { doLogout, doRegisterDnfAccount, doChangeDnfPassword, fetchDnfCharacList, doBindDnfCharac, fetchSignInInfo, doSignIn, fetchJiFenDuiHuanInfo, doJiFenDuiHuan, doJiFenDuiHuanWish } from '@/api'
import { CheckmarkOutline as CheckIcon, LogOutOutline as LogoutIcon } from '@vicons/ionicons5'

const commonStore = useCommonStore()

const router = useRouter()

// 注册 + 修改密码
const dnfaccount = ref({
  username: '',
  password: '',
})
// 绑定角色
const dnfCharacList = ref([])
const dnfCharacId = ref(null)
// 签到
const signInInfo = ref({
  conf: {
    dailyCash: 0,
    cumulativeCash: {},
  },
  items: [],
  signInDays: [],
})
// 积分兑换
const fuliduihuan = ref({
  categorys: [],
  defaultTab: '',
  count: 1
})

// 弹窗 ref 保存
const popoverRefs = new Map()
const saveRef = (el, type, id) => {
  if (!popoverRefs.has(type)) {
    popoverRefs.set(type, {})
  }
  popoverRefs.get(type)[id] = el
}

// 退出登录
const logout = async () => {
  await doLogout()
  router.push('/login')
}

// 注册游戏账号
const registerDnfAccount = async () => {
  if (!dnfaccount.value.password) {
    window.$message.warning('请输入密码')
    return
  }

  await doRegisterDnfAccount({ dnfUsername: dnfaccount.value.username, dnfPassword: md5(dnfaccount.value.password) })
  await commonStore.fetchUserInfo()
  dnfaccount.value.username = ''
  dnfaccount.value.password = ''
  window.$message.success('注册成功')
}
// 修改游戏密码
const changeDnfPassword = async () => {
  if (!dnfaccount.value.password) {
    window.$message.warning('请输入密码')
    return
  }

  await doChangeDnfPassword({ dnfPassword: md5(dnfaccount.value.password) })
  dnfaccount.value.password = ''
  window.$message.success('修改成功')
}

// 绑定角色
const bindDnfCharac = async () => {
  if (!dnfCharacId.value) {
    window.$message.warning('请选择要绑定的角色')
    return
  }

  await doBindDnfCharac({ characNo: dnfCharacId.value })
  await commonStore.fetchUserInfo()
  window.$message.success('绑定成功')
}

// 签到
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
// 确认签到
const confirmSignIn = async () => {
  const res = await doSignIn()
  window.$dialog.success({
    title: '签到成功',
    content: `本月已签到 ${ signInInfo.value.signInDays.length + 1 } 天`,
  })
  signInInfo.value = await fetchSignInInfo()
  await commonStore.fetchUserInfo()
}
// 签到奖励格式化
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
// 签到日历显示颜色
const qiandaoColor = (m, d) => {
  const nowMonth = ((new Date()).getMonth() + 1)
  const nowDate = (new Date()).getDate()
  const isCheck = signInInfo.value.signInDays.includes(d)

  if (m != nowMonth) return '#000'
  if (isCheck) return '#84cc16'
  if (nowDate > d) return '#ef4444'
  return '#000'
}
// 签到日历显示文字
const qiandaoStatus = (m, d) => {
  const nowMonth = ((new Date()).getMonth() + 1)
  const nowDate = (new Date()).getDate()
  const isCheck = signInInfo.value.signInDays.includes(d)

  if (m != nowMonth) return ''
  if (isCheck) return '√'
  if (nowDate > d) return 'X'
  return ''
}

// 福利兑换购买商品
const buyFuLiDuiHuan = async (id) => {
  if (!commonStore.userInfo.dnfBindCharacName) {
    window.$message.warning('请需要先绑定角色，才能进行兑换')
    return
  }

  popoverRefs.get('fuliduihuan')[id].setShow(false)

  await doJiFenDuiHuan({
    goodsId: id,
    count: fuliduihuan.value.count
  })
  const [ data, _ ] = await Promise.all([fetchJiFenDuiHuanInfo(), commonStore.fetchUserInfo()])
  fuliduihuan.value.categorys = data

  window.$message.success('兑换成功')
}

// 页面加载时，准备数据
onMounted(async () => {
  // 从服务器获取数据
  const [
    signInInfoData, // 签到信息
    dnfCharacListData, // 角色列表
    jiFenDuiHuanInfoData, // 积分兑换信息
  ] = await Promise.all([
    fetchSignInInfo(),
    fetchDnfCharacList(),
    fetchJiFenDuiHuanInfo(),
  ])

  // 保存数据
  signInInfo.value = signInInfoData
  dnfCharacList.value = dnfCharacListData.map((item) => ({
    label: item.charac_name,
    value: item.charac_no,
  }))
  fuliduihuan.value.categorys = jiFenDuiHuanInfoData
  if (jiFenDuiHuanInfoData.length > 0) {
    fuliduihuan.value.defaultTab = jiFenDuiHuanInfoData[0].id
  } else {
    fuliduihuan.value.defaultTab = 'wish'
  }
})

</script>

<style lang="scss" scoped>
// 隐藏签到日历的上个月、下个月按钮
:deep(.n-calendar-header__extra > .n-button-group) {
  display: none;
}
</style>
