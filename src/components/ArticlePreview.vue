<script setup lang="ts">
/** 文章预览外壳：切换预览宽度，并向导出逻辑暴露真实文章 DOM。 */
import { computed, ref } from 'vue'
import { AlignLeft, Clipboard } from 'lucide-vue-next'
import type { ArticleDocument, PreviewMode, QualityResult } from '../types/article'
import NvidiaTemplate from '../templates/NvidiaTemplate.vue'
import PreviewToolbar from './PreviewToolbar.vue'
import QualityPanel from './QualityPanel.vue'

const props = defineProps<{ article: ArticleDocument | null; mode: PreviewMode; quality: QualityResult[] }>()
const emit = defineEmits<{ 'update:mode': [value: PreviewMode]; copy: [] }>()
const previewBody = ref<HTMLElement | null>(null)
const shellClass = computed(() => ['article-stage', `is-${props.mode}`])

function getArticleElement(): HTMLElement | null {
  // PNG 只截取带标记的 article，不包含工具栏、空状态和质量面板。
  return previewBody.value?.querySelector('[data-brand-article="true"]') as HTMLElement | null
}
defineExpose({ getArticleElement })
</script>

<template>
  <section class="workspace-card preview-card">
    <div class="section-heading preview-heading">
      <h2>公众号预览</h2>
      <PreviewToolbar :model-value="mode" @update:model-value="$emit('update:mode', $event)" />
    </div>
    <div :class="shellClass">
      <div ref="previewBody" class="preview-body">
        <NvidiaTemplate v-if="article" :article="article" />
        <div v-else class="preview-empty">
          <span><AlignLeft :size="24" stroke-width="1.8" /></span>
          <h3>还没有预览内容</h3>
          <p>在左侧输入或粘贴文章，点击「一键智能排版」后即可查看效果。</p>
        </div>
      </div>
    </div>
    <div class="preview-footer-actions">
      <button class="copy-button" type="button" :disabled="!article" @click="$emit('copy')"><Clipboard :size="19" />复制到公众号</button>
      <QualityPanel :results="quality" />
    </div>
  </section>
</template>
