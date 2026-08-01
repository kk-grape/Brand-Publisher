<script setup lang="ts">
/** 全局操作反馈；显示时机和自动关闭计时由 App 统一管理。 */
import { CheckCircle2, CircleAlert } from 'lucide-vue-next'
defineProps<{ message: string; type: 'success' | 'error' }>()
</script>

<template>
  <Transition name="toast">
    <div v-if="message" :class="['toast-message', type]" role="status">
      <CheckCircle2 v-if="type === 'success'" :size="19" />
      <CircleAlert v-else :size="19" />
      {{ message }}
    </div>
  </Transition>
</template>
