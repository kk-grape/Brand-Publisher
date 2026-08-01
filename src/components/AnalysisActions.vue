<script setup lang="ts">
/** 三张分析摘要卡只展示规则统计，不提供独立的虚假操作入口。 */
import { FileSearch2, Focus, PanelsTopLeft } from 'lucide-vue-next'
import type { ArticleStats } from '../types/article'

defineProps<{ stats: ArticleStats; hasContent: boolean; hasLongParagraph: boolean }>()
</script>

<template>
  <div class="analysis-actions" aria-label="规则分析摘要">
    <article><FileSearch2 :size="24" /><div><strong>AI 识别语意</strong><span>{{ hasContent ? `已识别 ${stats.headings} 个内容章节` : '提炼文章核心导语' }}</span></div></article>
    <article><Focus :size="24" /><div><strong>重点提炼</strong><span>{{ hasContent ? `发现 ${stats.highlights + stats.listItems} 处重点` : '识别关键词与数据' }}</span></div></article>
    <article><PanelsTopLeft :size="24" /><div><strong>段落优化</strong><span>{{ hasLongParagraph ? '发现长段落，建议拆分' : hasContent ? '当前段落节奏良好' : '优化表达与结构' }}</span></div></article>
  </div>
</template>
