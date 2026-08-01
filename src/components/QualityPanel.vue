<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { AlertTriangle, Check, CircleX, PanelRightOpen, X } from 'lucide-vue-next'
import type { QualityResult } from '../types/article'

const props = defineProps<{ results: QualityResult[] }>()
const panelRef = ref<HTMLElement | null>(null)
const isVisible = ref(true)
const isPositioned = ref(false)
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragOffset = { x: 0, y: 0 }
let activePointerId: number | null = null
let dragHandle: HTMLElement | null = null
const viewportGap = 12

const grade = computed(() => {
  if (!props.results.length) return { label: '待检测', tone: 'neutral' }
  if (props.results.some((result) => result.status === 'error')) return { label: '需调整', tone: 'error' }
  if (props.results.some((result) => result.status === 'warning')) return { label: '良好', tone: 'warning' }
  return { label: '优秀', tone: 'success' }
})
const panelStyle = computed<CSSProperties>(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  visibility: isPositioned.value ? 'visible' : 'hidden',
}))

function iconFor(status: QualityResult['status']) {
  return status === 'success' ? Check : status === 'warning' ? AlertTriangle : CircleX
}

function clampPosition(x: number, y: number) {
  const panel = panelRef.value
  if (!panel) return { x, y }
  const maxX = Math.max(viewportGap, window.innerWidth - panel.offsetWidth - viewportGap)
  const maxY = Math.max(viewportGap, window.innerHeight - panel.offsetHeight - viewportGap)
  return {
    x: Math.min(Math.max(viewportGap, x), maxX),
    y: Math.min(Math.max(viewportGap, y), maxY),
  }
}

async function resetPosition() {
  isPositioned.value = false
  await nextTick()
  const panel = panelRef.value
  if (!panel) return
  position.value = clampPosition(
    window.innerWidth - panel.offsetWidth - 18,
    window.innerHeight - panel.offsetHeight - 18,
  )
  isPositioned.value = true
}

function startDrag(event: PointerEvent) {
  if (event.button !== 0 || !panelRef.value) return
  event.preventDefault()
  activePointerId = event.pointerId
  dragHandle = event.currentTarget as HTMLElement
  dragHandle.setPointerCapture?.(event.pointerId)
  dragOffset.x = event.clientX - position.value.x
  dragOffset.y = event.clientY - position.value.y
  isDragging.value = true
  document.body.classList.add('is-dragging-quality')
}

function moveDrag(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== activePointerId) return
  event.preventDefault()
  position.value = clampPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y)
}

function endDrag(event?: PointerEvent) {
  if (event && activePointerId !== null && event.pointerId !== activePointerId) return
  if (dragHandle && activePointerId !== null && dragHandle.hasPointerCapture?.(activePointerId)) {
    dragHandle.releasePointerCapture(activePointerId)
  }
  activePointerId = null
  dragHandle = null
  isDragging.value = false
  document.body.classList.remove('is-dragging-quality')
}

function closePanel() {
  endDrag()
  isVisible.value = false
}

async function showPanel() {
  isVisible.value = true
  await resetPosition()
}

function handleResize() {
  if (!isVisible.value || !isPositioned.value) return
  position.value = clampPosition(position.value.x, position.value.y)
}

onMounted(() => {
  window.addEventListener('pointermove', moveDrag, { passive: false })
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  window.addEventListener('resize', handleResize)
  resetPosition()
})

watch(() => props.results.length, async () => {
  if (!isVisible.value) return
  await nextTick()
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  window.removeEventListener('resize', handleResize)
  endDrag()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="quality-float">
      <aside v-if="isVisible" ref="panelRef" :class="['quality-panel', { dragging: isDragging }]" :style="panelStyle">
        <header class="quality-drag-handle" @pointerdown="startDrag">
          <h3>排版质量检查</h3>
          <div class="quality-header-actions">
            <span :class="['quality-grade', grade.tone]"><i />{{ grade.label }}</span>
            <button class="quality-close" type="button" title="隐藏质量检查" aria-label="隐藏质量检查" @pointerdown.stop @click="closePanel"><X :size="15" /></button>
          </div>
        </header>
        <div v-if="!results.length" class="quality-empty">输入文章后，将实时显示结构与可读性建议。</div>
        <ul v-else>
          <li v-for="result in results" :key="result.id">
            <span :class="['quality-icon', result.status]"><component :is="iconFor(result.status)" :size="15" /></span>
            <div><strong>{{ result.title }}</strong><small>{{ result.description }}</small></div>
          </li>
        </ul>
      </aside>
    </Transition>
  </Teleport>
  <Transition name="quality-tab">
    <button v-if="!isVisible" class="quality-restore" type="button" title="显示排版检查" aria-label="显示排版检查" @click="showPanel">
      <PanelRightOpen :size="18" /><span>排版检查</span>
    </button>
  </Transition>
</template>
