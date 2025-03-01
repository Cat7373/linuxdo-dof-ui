<template lang="pug">
template(v-if="ready")
  router-view
template(v-else)
  n-flex(justify="center").mt-52
    div
      n-flex(justify="center")
        n-spin(size="large")
      p 加载中，请稍候...
</template>

<script setup>
import { useMessage, useDialog, useModal } from 'naive-ui'
import { loadBaseData } from '@/store'

const ready = ref(false)

onMounted(async () => {
  window.$message = useMessage()
  window.$dialog = useDialog()
  window.$modal = useModal()

  try {
    await loadBaseData()
  } finally {
    ready.value = true
  }
})
</script>
