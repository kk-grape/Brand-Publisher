<script setup lang="ts">
/** NVIDIA 模板组件只负责展示统一序列化后的安全内联 HTML。 */
import { computed } from 'vue'
import type { ArticleDocument } from '../types/article'
import { serializeArticle } from '../utils/serializeArticle'

const props = defineProps<{ article: ArticleDocument }>()
const html = computed(() => serializeArticle(props.article))
</script>

<template>
  <div class="nvidia-template" v-html="html" />
</template>
