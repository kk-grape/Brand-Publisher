<script setup lang="ts">
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
