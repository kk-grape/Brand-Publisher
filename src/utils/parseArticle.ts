/** Markdown 解析器：把 markdown-it token 归一化为模板可消费的 ArticleDocument。 */
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import type Token from 'markdown-it/lib/token.mjs'
import type { ArticleBlock, ArticleDocument, ArticleStats } from '../types/article'

const md = new MarkdownIt({ html: false, linkify: false, typographer: true, breaks: false })

/** 只保留公众号排版需要的少量行内标签，用户输入的原始 HTML 不会直接放行。 */
function safeInline(token?: Token): string {
  if (!token) return ''
  return DOMPurify.sanitize(md.renderer.renderInline(token.children ?? [], md.options, {}), {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'br', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
  })
}

function plainText(html: string): string {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent?.trim() ?? ''
}

export function parseArticle(source: string): ArticleDocument {
  const tokens = md.parse(source.trim(), {})
  const blocks: ArticleBlock[] = []
  let index = 0
  let id = 0
  let title = ''

  const push = (block: Omit<ArticleBlock, 'id'>) => blocks.push({ ...block, id: `block-${id++}` })

  // markdown-it 使用 open → inline → close token 表示常见块，这里按类型依次消费。
  while (index < tokens.length) {
    const token = tokens[index]

    if (token.type === 'heading_open') {
      const level = Number(token.tag.slice(1))
      const html = safeInline(tokens[index + 1])
      const text = plainText(html)
      if (level === 1 && !title) {
        title = text
        push({ type: 'title', text, html, level })
      } else {
        push({ type: 'heading', text, html, level })
      }
      index += 3
      continue
    }

    if (token.type === 'paragraph_open') {
      const html = safeInline(tokens[index + 1])
      push({ type: 'paragraph', text: plainText(html), html })
      index += 3
      continue
    }

    if (token.type === 'blockquote_open') {
      // 引用内部可能还有 paragraph token，找到结束位置后只提取其中的 inline 内容。
      const closeIndex = tokens.findIndex((item, position) => position > index && item.type === 'blockquote_close')
      const inline = tokens.slice(index + 1, closeIndex).find((item) => item.type === 'inline')
      const html = safeInline(inline)
      push({ type: 'quote', text: plainText(html), html })
      index = closeIndex >= 0 ? closeIndex + 1 : index + 1
      continue
    }

    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      const ordered = token.type === 'ordered_list_open'
      const closeType = ordered ? 'ordered_list_close' : 'bullet_list_close'
      const items: Array<{ text: string; html: string }> = []
      let cursor = index + 1
      let depth = 1
      // depth 防止嵌套列表的 close token 提前结束当前列表。
      while (cursor < tokens.length && depth > 0) {
        if (tokens[cursor].type === token.type) depth += 1
        if (tokens[cursor].type === closeType) depth -= 1
        if (depth === 1 && tokens[cursor].type === 'inline') {
          const html = safeInline(tokens[cursor])
          items.push({ text: plainText(html), html })
        }
        cursor += 1
      }
      push({
        type: ordered ? 'ordered-list' : 'unordered-list',
        text: items.map((item) => item.text).join(' '),
        html: '',
        items,
      })
      index = cursor
      continue
    }

    index += 1
  }

  const now = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date())

  return { title, blocks, brand: 'NVIDIA 英伟达', publishedAt: now, location: '上海' }
}

export function getArticleStats(source: string, article: ArticleDocument): ArticleStats {
  return {
    characters: source.replace(/\s/g, '').length,
    headings: article.blocks.filter((block) => block.type === 'heading').length,
    quotes: article.blocks.filter((block) => block.type === 'quote').length,
    lists: article.blocks.filter((block) => block.type.endsWith('list')).length,
    listItems: article.blocks.reduce((total, block) => total + (block.items?.length ?? 0), 0),
    highlights: (source.match(/\*\*[^*]+\*\*/g) ?? []).length,
  }
}
