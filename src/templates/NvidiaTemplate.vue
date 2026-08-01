<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleDocument } from '../types/article'
import { serializeArticle } from '../utils/serializeArticle'

const props = defineProps<{ article: ArticleDocument }>()
const html = computed(() => serializeArticle(props.article))
</script>

<template>
  <div class="nvidia-template" v-html="html" />
</template>
