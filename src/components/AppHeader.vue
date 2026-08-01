<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown, Download, Plus, RotateCcw, Sparkles } from 'lucide-vue-next'
import type { TemplateId, TemplateMenuItem } from '../types/article'
import ExportMenu from './ExportMenu.vue'
import ProductLogo from './ProductLogo.vue'

defineProps<{ canExport: boolean; currentTemplate: TemplateId; templates: TemplateMenuItem[] }>()
const emit = defineEmits<{ example: []; reset: []; exportHtml: []; exportPng: [] }>()
const showExport = ref(false)
const showTemplates = ref(false)
const exportArea = ref<HTMLElement | null>(null)
const templateArea = ref<HTMLElement | null>(null)

function closeOnOutside(event: MouseEvent) {
  if (!exportArea.value?.contains(event.target as Node)) showExport.value = false
  if (!templateArea.value?.contains(event.target as Node)) showTemplates.value = false
}
function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    showExport.value = false
    showTemplates.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', closeOnOutside)
  document.addEventListener('keydown', closeOnEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
  document.removeEventListener('keydown', closeOnEscape)
})

function choose(kind: 'html' | 'png') {
  showExport.value = false
  kind === 'html' ? emit('exportHtml') : emit('exportPng')
}
</script>

<template>
  <header class="app-header">
    <div class="brand-cluster">
      <ProductLogo />
      <strong class="product-name">品牌公众号排版器</strong>
      <span class="header-divider" />
      <span class="template-label">模板选择：</span>
      <div ref="templateArea" class="template-wrapper">
        <button class="template-select" type="button" aria-label="当前模板：NVIDIA 官方模板" :aria-expanded="showTemplates" @click="showTemplates = !showTemplates">
          <img :src="templates[0]?.logo" alt="NVIDIA" />
          <b>NVIDIA 官方模板</b>
          <ChevronDown :size="16" />
        </button>
        <div v-if="showTemplates" class="template-menu" role="menu">
          <p>品牌模板</p>
          <button v-for="item in templates" :key="item.id" type="button" :class="{ disabled: item.disabled }" :disabled="item.disabled" role="menuitem">
            <span class="template-menu-logo">
              <img v-if="item.logo" :src="item.logo" :alt="item.name" />
              <Plus v-else :size="19" />
            </span>
            <span class="template-menu-copy"><strong>{{ item.name }}</strong><small>{{ item.description }}</small></span>
            <span v-if="item.badge" class="template-badge">{{ item.badge }}</span>
            <Check v-else-if="item.id === currentTemplate" class="template-check" :size="17" />
          </button>
        </div>
      </div>
    </div>
    <nav class="header-actions" aria-label="全局操作">
      <button class="button secondary" type="button" @click="$emit('example')"><Sparkles :size="17" />示例文章</button>
      <button class="button secondary" type="button" @click="$emit('reset')"><RotateCcw :size="17" />重置</button>
      <div ref="exportArea" class="export-wrapper">
        <button class="button primary" type="button" :disabled="!canExport" :aria-expanded="showExport" @click.stop="showExport = !showExport">
          <Download :size="17" />导出<ChevronDown :size="14" />
        </button>
        <ExportMenu v-if="showExport" :disabled="!canExport" @html="choose('html')" @png="choose('png')" />
      </div>
    </nav>
  </header>
</template>
