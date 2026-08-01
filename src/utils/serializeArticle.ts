/**
 * NVIDIA 模板序列化器：把 ArticleDocument 转成只包含内联样式的安全 HTML。
 * 页面预览、公众号复制和 HTML 导出都调用这里，确保三处视觉结果一致。
 */
import DOMPurify from 'dompurify'
import type { ArticleBlock, ArticleDocument } from '../types/article'
import { articleStyles as s } from '../templates/nvidiaTheme'

function renderList(items: NonNullable<ArticleDocument['blocks'][number]['items']>, ordered: boolean): string {
  const markerCell = ordered ? s.orderedMarkerCell : s.markerCell
  const textCell = ordered ? s.orderedListText : s.listText

  // 不使用 ol/ul 的默认标记，避免微信清理 style 后重新显示浏览器序号或圆点。
  return `<section style="${s.list}">${items.map((item, index) => `<section style="${s.listItem}"><span style="${markerCell}">${ordered ? `<span style="${s.orderedMarker}">${index + 1}</span>` : `<span style="${s.unorderedMarker}">○</span>`}</span><span style="${textCell}">${highlightQuotedText(item.html)}</span></section>`).join('')}</section>`
}

interface TextSegment {
  node: Text
  start: number
  end: number
}

/**
 * 将成对双引号及其中内容标为品牌绿色。
 * Range 可以跨越 strong 等子节点，不会破坏 Markdown 已生成的行内结构。
 */
function highlightQuotedText(html: string): string {
  const container = document.createElement('div')
  container.innerHTML = html
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const segments: TextSegment[] = []
  let fullText = ''
  let current = walker.nextNode() as Text | null

  while (current) {
    const start = fullText.length
    fullText += current.data
    segments.push({ node: current, start, end: fullText.length })
    current = walker.nextNode() as Text | null
  }

  const matches = [...fullText.matchAll(/“[^”]*”|"[^"]*"/g)]
  // 从后向前包装，避免前一个 DOM 修改影响后续匹配的字符位置。
  for (const match of matches.reverse()) {
    if (match.index === undefined) continue
    const startOffset = match.index
    const endOffset = startOffset + match[0].length
    const startSegment = segments.find((segment) => startOffset >= segment.start && startOffset < segment.end)
    const endSegment = segments.find((segment) => endOffset > segment.start && endOffset <= segment.end)
    if (!startSegment || !endSegment) continue

    const range = document.createRange()
    range.setStart(startSegment.node, startOffset - startSegment.start)
    range.setEnd(endSegment.node, endOffset - endSegment.start)
    const highlightedContent = range.extractContents()
    const highlight = document.createElement('span')
    highlight.setAttribute('style', s.quotedText)
    highlight.appendChild(highlightedContent)
    range.insertNode(highlight)
  }

  return container.innerHTML
}

function renderHeading(block: ArticleBlock): string {
  const isSubheading = Boolean(block.level && block.level >= 3)
  if (isSubheading) {
    return `<p style="${s.subheadingWrap}"><span style="${s.subheading}">${block.html}</span></p>`
  }
  return `<p style="${s.headingWrap}"><span style="${s.headingLineOuter}"><span style="${s.headingLineInner}"><span style="${s.heading}">${block.html}</span></span></span></p>`
}

function renderSectionDivider(): string {
  return `<p style="${s.sectionDivider}"><span style="${s.sectionLine}">──────────</span><span style="${s.sectionDiamond}">◇</span><span style="${s.sectionLine}">──────────</span></p>`
}

function renderBlock(block: ArticleBlock): string {
  if (block.type === 'heading') return renderHeading(block)
  if (block.type === 'paragraph') return `<p style="${s.paragraph}">${highlightQuotedText(block.html)}</p>`
  if (block.type === 'quote') return `<section style="${s.quote}"><span style="${s.quoteMark}">“</span><span>${block.html}</span></section>`
  if (block.type === 'unordered-list') return renderList(block.items ?? [], false)
  if (block.type === 'ordered-list') return renderList(block.items ?? [], true)
  return ''
}

function renderBody(blocks: ArticleBlock[]): string {
  const content = blocks.filter((block) => block.type !== 'title')
  const rendered: string[] = []
  let hasLevelTwoSection = false

  for (const block of content) {
    // 二级标题划分文章大章节；三级标题属于当前章节，不单独产生绿色菱形分割线。
    if (block.type === 'heading' && block.level === 2) {
      if (hasLevelTwoSection) rendered.push(renderSectionDivider())
      hasLevelTwoSection = true
    }
    rendered.push(renderBlock(block))
  }
  return rendered.join('')
}

export function serializeArticle(article: ArticleDocument): string {
  const body = renderBody(article.blocks)
  const titleBlock = article.blocks.find((block) => block.type === 'title')
  const titleHtml = titleBlock?.html ?? ''
  const header = article.title.trim()
    ? `<section><p style="${s.titleAccent}"><span style="${s.titleAccentGreen}">▬▬▬</span><span style="${s.titleAccentBlack}">▬</span></p><p style="${s.title}">${titleHtml || article.title}</p></section>`
    : ''

  const html = `<section data-brand-article="true" style="${s.article}">
    ${header}
    <section>${body}</section>
    <section style="${s.cta}">
      <p style="${s.ctaTitle}">从云端到边缘，释放 AI 的无限潜能</p>
      <p style="${s.ctaText}">与 NVIDIA 一起，加速行业智能化升级</p>
      <p style="${s.ctaAction}"><span style="${s.ctaButton}">了解更多解决方案 →</span></p>
    </section>
  </section>`

  // 即使上游已经过滤过，这里仍在最终出口做一次白名单清洗。
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['section', 'p', 'span', 'strong', 'em', 'code', 'br', 'a'],
    ALLOWED_ATTR: ['style', 'data-brand-article', 'href', 'title'],
  })
}

export function articlePlainText(article: ArticleDocument): string {
  // text/plain 是 ClipboardItem 的备用格式，不包含任何 HTML 样式。
  const lines = [article.title]
  for (const block of article.blocks) {
    if (block.type === 'title') continue
    if (block.items) lines.push(...block.items.map((item) => item.text))
    else lines.push(block.text)
  }
  lines.push('从云端到边缘，释放 AI 的无限潜能')
  return lines.filter(Boolean).join('\n\n')
}
