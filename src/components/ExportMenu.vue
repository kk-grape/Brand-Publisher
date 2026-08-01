<script setup lang="ts">
/** 轻量导出菜单：仅声明用户选择，实际文件生成由父组件处理。 */
import { FileCode2, ImageDown } from 'lucide-vue-next'

defineProps<{ disabled: boolean }>()
defineEmits<{ html: []; png: [] }>()
</script>

<template>
  <div class="export-menu" role="menu">
    <button type="button" role="menuitem" :disabled="disabled" @click="$emit('html')">
      <FileCode2 :size="17" /><span><strong>导出 HTML 文件</strong><small>保留完整内联样式</small></span>
    </button>
    <button type="button" role="menuitem" :disabled="disabled" @click="$emit('png')">
      <ImageDown :size="17" /><span><strong>导出预览 PNG</strong><small>仅截取文章主体</small></span>
    </button>
  </div>
</template>
