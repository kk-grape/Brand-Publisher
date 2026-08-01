<script setup lang="ts">
/** 应用状态编排层：连接编辑器、两种解析方式、预览、质量检查、复制和导出。 */
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
import { getAiErrorMessage, parseArticleWithAi } from './services/aiArticleParser'

const STORAGE = {
  source: 'brand-publisher:source',
  template: 'brand-publisher:template',
  mode: 'brand-publisher:preview-mode',
} as const

function readStorage(key: string, fallback = ''): string {
  // 隐私模式等环境可能禁用 localStorage，因此读取失败时安全回退。
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
// 预览文章和对应原文必须成对保存，质量检查才不会误用正在编辑的新内容。
const formattedSource = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const parsedDraft = computed(() => parseArticle(source.value))
// 编辑统计实时读取草稿；质量面板有预览时则检查已生成的那一版文章。
const stats = computed(() => getArticleStats(source.value, parsedDraft.value))
const quality = computed(() => formattedArticle.value
  ? runQualityChecks(formattedSource.value, formattedArticle.value)
  : runQualityChecks(source.value, parsedDraft.value))
const hasLongParagraph = computed(() => parsedDraft.value.blocks.some((block) => block.type === 'paragraph' && block.text.length > 150))
const previewRef = ref<InstanceType<typeof ArticlePreview> | null>(null)
const toast = ref({ message: '', type: 'success' as 'success' | 'error' })
let toastTimer: number | undefined
// 每次 AI 请求获得一个版本号，旧响应无法覆盖清空、重置或后续请求的状态。
let aiRequestVersion = 0

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
  // 新提示会替换旧计时器，避免前一个 Toast 提前关闭后一个 Toast。
  window.clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = window.setTimeout(() => { toast.value.message = '' }, 2800)
}

function cancelAiRequest() {
  // fetch 可能仍在网络层运行，但版本失效后，它的结果不会再写入界面。
  aiRequestVersion += 1
  aiLoading.value = false
  aiError.value = ''
}

function formatMarkdownArticle() {
  if (!source.value.trim() || aiLoading.value) return
  aiError.value = ''
  formattedArticle.value = parseArticle(source.value)
  formattedSource.value = source.value
  showToast('Markdown 识别完成，预览已更新')
}

async function formatAiArticle() {
  if (!source.value.trim() || aiLoading.value) return
  const requestVersion = ++aiRequestVersion
  const sourceSnapshot = source.value
  aiLoading.value = true
  aiError.value = ''

  try {
    const article = await parseArticleWithAi(sourceSnapshot)
    if (requestVersion !== aiRequestVersion) return
    // 用户在分析期间继续输入时，丢弃基于旧文本生成的结果。
    if (source.value !== sourceSnapshot) {
      aiError.value = '原始内容在分析期间发生了变化，请重新发起 AI 排版。'
      showToast('已忽略过期的 AI 分析结果', 'error')
      return
    }
    formattedArticle.value = article
    formattedSource.value = sourceSnapshot
    showToast('AI 分析完成，预览已更新')
  } catch (error) {
    // formattedArticle 不在失败分支中赋值，因此上一次成功预览会自然保留。
    if (requestVersion !== aiRequestVersion) return
    console.error(error)
    aiError.value = getAiErrorMessage(error)
    showToast('AI 分析失败，上一次排版结果已保留', 'error')
  } finally {
    if (requestVersion === aiRequestVersion) aiLoading.value = false
  }
}

function loadExample() {
  cancelAiRequest()
  source.value = exampleArticle
  formattedArticle.value = null
  formattedSource.value = ''
  showToast('示例文章已填充，可选择 Markdown 或 AI 排版')
}

function clearSource() {
  cancelAiRequest()
  source.value = ''
  formattedArticle.value = null
  formattedSource.value = ''
  showToast('编辑内容已清空')
}

function resetAll() {
  cancelAiRequest()
  source.value = ''
  formattedArticle.value = null
  formattedSource.value = ''
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
      <!-- 左右组件只通过类型化 props 和事件通信，模板渲染不接触原始输入。 -->
      <SourceEditor
        v-model="source"
        :stats="stats"
        :has-long-paragraph="hasLongParagraph"
        :ai-loading="aiLoading"
        :ai-error="aiError"
        @format-markdown="formatMarkdownArticle"
        @format-ai="formatAiArticle"
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
