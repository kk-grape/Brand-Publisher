<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Trash2 } from 'lucide-vue-next'
import type { ArticleStats } from '../types/article'
import AnalysisActions from './AnalysisActions.vue'

const props = defineProps<{ modelValue: string; stats: ArticleStats; hasLongParagraph: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; format: []; clear: [] }>()
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
    <button class="format-button" type="button" :disabled="!modelValue.trim()" @click="$emit('format')"><Sparkles :size="21" />一键智能排版</button>
  </section>
</template>
