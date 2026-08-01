<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import SourceEditor from './components/SourceEditor.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import ToastMessage from './components/ToastMessage.vue'
import { exampleArticle } from './data/exampleArticle'
import nvidiaLogo from './assets/nvidia-logo-horz.svg'
import type { ArticleDocument, PreviewMode, TemplateId, TemplateMenuItem } from './types/article'
import { getArticleStats, parseArticle } from './utils/parseArticle'
import { runQualityChecks } from './utils/qualityCheck'
import { copyArticle } from './utils/copyToClipboard'
import { exportArticleHtml, exportArticlePng } from './utils/exportArticle'

const STORAGE = {
  source: 'brand-publisher:source',
  template: 'brand-publisher:template',
  mode: 'brand-publisher:preview-mode',
} as const

function readStorage(key: string, fallback = ''): string {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

const source = ref(readStorage(STORAGE.source))
const savedTemplate = readStorage(STORAGE.template)
const templateId = ref<TemplateId>(savedTemplate === 'nvidia-official' ? savedTemplate : 'nvidia-official')
const templateMenuItems: TemplateMenuItem[] = [
  { id: 'nvidia-official', name: 'NVIDIA 官方模板', description: '品牌标准排版与公众号样式', logo: nvidiaLogo },
  { id: 'custom', name: '自定义添加', description: '创建并管理专属品牌模板', disabled: true, badge: '即将支持' },
]
const savedMode = readStorage(STORAGE.mode)
const previewMode = ref<PreviewMode>(savedMode === 'desktop' ? 'desktop' : 'mobile')
const formattedArticle = ref<ArticleDocument | null>(null)
const parsedDraft = computed(() => parseArticle(source.value))
const stats = computed(() => getArticleStats(source.value, parsedDraft.value))
const quality = computed(() => runQualityChecks(source.value, parsedDraft.value))
const hasLongParagraph = computed(() => parsedDraft.value.blocks.some((block) => block.type === 'paragraph' && block.text.length > 150))
const previewRef = ref<InstanceType<typeof ArticlePreview> | null>(null)
const toast = ref({ message: '', type: 'success' as 'success' | 'error' })
let toastTimer: number | undefined

watch(source, (value) => {
  try { localStorage.setItem(STORAGE.source, value) } catch { /* storage can be unavailable */ }
})
watch(previewMode, (value) => {
  try { localStorage.setItem(STORAGE.mode, value) } catch { /* storage can be unavailable */ }
})
watch(templateId, (value) => {
  try { localStorage.setItem(STORAGE.template, value) } catch { /* storage can be unavailable */ }
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  window.clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = window.setTimeout(() => { toast.value.message = '' }, 2800)
}

function formatArticle() {
  if (!source.value.trim()) return
  formattedArticle.value = parseArticle(source.value)
  showToast('智能排版已完成，预览已更新')
}

function loadExample() {
  source.value = exampleArticle
  formattedArticle.value = null
  showToast('示例文章已填充，点击一键智能排版查看效果')
}

function clearSource() {
  source.value = ''
  formattedArticle.value = null
  showToast('编辑内容已清空')
}

function resetAll() {
  source.value = ''
  formattedArticle.value = null
  previewMode.value = 'mobile'
  templateId.value = 'nvidia-official'
  try {
    localStorage.removeItem(STORAGE.source)
    localStorage.setItem(STORAGE.mode, 'mobile')
    localStorage.setItem(STORAGE.template, 'nvidia-official')
  } catch { /* storage can be unavailable */ }
  showToast('已重置排版器')
}

async function handleCopy() {
  if (!formattedArticle.value) return
  try {
    await copyArticle(formattedArticle.value)
    showToast('富文本已复制，可直接粘贴到公众号编辑器')
  } catch (error) {
    console.error(error)
    showToast('复制失败，请检查浏览器剪贴板权限', 'error')
  }
}

function handleExportHtml() {
  if (!formattedArticle.value) return
  exportArticleHtml(formattedArticle.value)
  showToast('HTML 文件已导出')
}

async function handleExportPng() {
  if (!formattedArticle.value) return
  const element = previewRef.value?.getArticleElement()
  if (!element) return showToast('未找到可导出的文章预览', 'error')
  try {
    await exportArticlePng(element, formattedArticle.value.title)
    showToast('PNG 图片已导出')
  } catch (error) {
    console.error(error)
    showToast('图片导出失败，请稍后重试', 'error')
  }
}

onBeforeUnmount(() => window.clearTimeout(toastTimer))
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :can-export="Boolean(formattedArticle)"
      :current-template="templateId"
      :templates="templateMenuItems"
      @example="loadExample"
      @reset="resetAll"
      @export-html="handleExportHtml"
      @export-png="handleExportPng"
    />
    <main class="workspace">
      <SourceEditor
        v-model="source"
        :stats="stats"
        :has-long-paragraph="hasLongParagraph"
        @format="formatArticle"
        @clear="clearSource"
      />
      <ArticlePreview
        ref="previewRef"
        :article="formattedArticle"
        :mode="previewMode"
        :quality="quality"
        @update:mode="previewMode = $event"
        @copy="handleCopy"
      />
    </main>
    <ToastMessage :message="toast.message" :type="toast.type" />
  </div>
</template>
