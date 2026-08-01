<script setup lang="ts">
import { Monitor, Smartphone } from 'lucide-vue-next'
import type { PreviewMode } from '../types/article'

defineProps<{ modelValue: PreviewMode }>()
defineEmits<{ 'update:modelValue': [value: PreviewMode] }>()
</script>

<template>
  <div class="preview-toggle" role="group" aria-label="预览尺寸">
    <button type="button" :class="{ active: modelValue === 'mobile' }" @click="$emit('update:modelValue', 'mobile')"><Smartphone :size="16" />手机预览</button>
    <button type="button" :class="{ active: modelValue === 'desktop' }" @click="$emit('update:modelValue', 'desktop')"><Monitor :size="16" />电脑预览</button>
  </div>
</template>
