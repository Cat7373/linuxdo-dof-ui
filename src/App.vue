<template lang="pug">
n-config-provider(:locale="zhCN", :date-locale="dateZhCN")
  n-dialog-provider
    n-message-provider
      n-modal-provider
        AppWrapper
</template>

<script setup>
import { onMounted } from 'vue'
import AppWrapper from '@/AppWrapper.vue'
import { zhCN, dateZhCN } from 'naive-ui'
</script>
