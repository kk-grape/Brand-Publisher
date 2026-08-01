<script setup lang="ts">
/** 原文编辑器：只收集输入并展示统计，具体解析工作通过事件交给 App。 */
import { computed } from 'vue'
import { AlertCircle, FileCode2, LoaderCircle, Sparkles, Trash2 } from 'lucide-vue-next'
import type { ArticleStats } from '../types/article'
import AnalysisActions from './AnalysisActions.vue'

const props = defineProps<{
  modelValue: string
  stats: ArticleStats
  hasLongParagraph: boolean
  aiLoading: boolean
  aiError: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'format-markdown': []
  'format-ai': []
  clear: []
}>()
const status = computed(() => props.modelValue.trim() ? '已识别正文' : '等待输入')
</script>

<template>
  <section class="workspace-card source-card">
    <div class="section-heading"><h2>原始内容</h2></div>
    <div class="editor-frame">
      <div class="editor-meta"><span :class="['recognition-pill', { empty: !modelValue.trim() }]">{{ status }}<template v-if="modelValue.trim()"> · {{ stats.characters }} 字</template></span><span class="markdown-support">支持 Markdown 语法</span></div>
      <textarea
        class="source-textarea"
        :value="modelValue"
        spellcheck="false"
        aria-label="原始文章内容"
        placeholder="# 在这里粘贴文章标题&#10;&#10;## 使用小标题组织内容&#10;&#10;支持普通文字、Markdown、引用与列表……"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
      <div class="editor-footer">
        <span>已自动识别：<b>{{ stats.headings }}</b> 个小标题 / <b>{{ stats.quotes }}</b> 条引用 / <b>{{ stats.listItems }}</b> 个要点</span>
        <button type="button" :disabled="!modelValue" @click="$emit('clear')"><Trash2 :size="14" />清空</button>
      </div>
    </div>
    <AnalysisActions :stats="stats" :has-content="Boolean(modelValue.trim())" :has-long-paragraph="hasLongParagraph" />
    <div class="format-actions">
      <Transition name="format-error">
        <div v-if="aiError" class="ai-format-error" role="alert">
          <AlertCircle :size="16" />
          <span>{{ aiError }}</span>
          <button type="button" :disabled="aiLoading" @click="$emit('format-ai')">重新尝试</button>
          <button type="button" :disabled="aiLoading" @click="$emit('format-markdown')">Markdown 识别</button>
        </div>
      </Transition>
      <div class="format-buttons">
        <!-- Markdown 与 AI 是两个入口，但最终都会得到同一种 ArticleDocument。 -->
        <button
          class="format-button markdown-format-button"
          type="button"
          :disabled="!modelValue.trim() || aiLoading"
          title="使用 Markdown 标记识别文章结构"
          @click="$emit('format-markdown')"
        >
          <FileCode2 :size="18" />Markdown 识别排版
        </button>
        <button
          class="format-button ai-format-button"
          type="button"
          :disabled="!modelValue.trim() || aiLoading"
          :aria-busy="aiLoading"
          title="使用 AI 服务分析普通文本结构"
          @click="$emit('format-ai')"
        >
          <LoaderCircle v-if="aiLoading" class="loading-spinner" :size="19" />
          <Sparkles v-else :size="19" />
          {{ aiLoading ? 'AI 正在分析……' : 'AI 智能排版' }}
        </button>
      </div>
    </div>
  </section>
</template>
