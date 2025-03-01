<template lang="pug">
n-result(status="warning", title="地址错误", :description="`没有找到页面，${t}s 后自动回到首页`")
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const route = useRouter()

let t = ref(5)
let p = setInterval(() => {
  t.value -= 1
  if (t.value == 0) {
    route.push('/')
    clearInterval(p)
  }
}, 1000)
</script>
