<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clipboard, FileText } from 'lucide-vue-next'
import type { ArticleDocument, PreviewMode, QualityResult } from '../types/article'
import NvidiaTemplate from '../templates/NvidiaTemplate.vue'
import PreviewToolbar from './PreviewToolbar.vue'
import QualityPanel from './QualityPanel.vue'

const props = defineProps<{ article: ArticleDocument | null; mode: PreviewMode; quality: QualityResult[] }>()
const emit = defineEmits<{ 'update:mode': [value: PreviewMode]; copy: [] }>()
const previewBody = ref<HTMLElement | null>(null)
const shellClass = computed(() => ['article-stage', `is-${props.mode}`])

function getArticleElement(): HTMLElement | null {
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
          <span><FileText :size="30" /></span>
          <h3>排版预览将在这里生成</h3>
          <p>在左侧粘贴文章，然后点击“一键智能排版”。</p>
        </div>
      </div>
    </div>
    <div class="preview-footer-actions">
      <button class="copy-button" type="button" :disabled="!article" @click="$emit('copy')"><Clipboard :size="19" />复制到公众号</button>
      <QualityPanel :results="quality" />
    </div>
  </section>
</template>
