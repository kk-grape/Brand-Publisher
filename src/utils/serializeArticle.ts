import DOMPurify from 'dompurify'
import type { ArticleDocument } from '../types/article'
import { articleStyles as s } from '../templates/nvidiaTheme'

function renderList(items: NonNullable<ArticleDocument['blocks'][number]['items']>, ordered: boolean): string {
  return `<ol style="${s.list}">${items.map((item, index) => `<li style="${s.listItem}"><span style="${s.bullet}">${ordered ? index + 1 : '•'}</span><span>${item.html}</span></li>`).join('')}</ol>`
}

export function serializeArticle(article: ArticleDocument): string {
  const body = article.blocks
    .filter((block) => block.type !== 'title')
    .map((block) => {
      if (block.type === 'heading') return `<h2 style="${block.level && block.level >= 3 ? s.subheading : s.heading}">${block.html}</h2>`
      if (block.type === 'paragraph') return `<p style="${s.paragraph}">${block.html}</p>`
      if (block.type === 'quote') return `<blockquote style="${s.quote}"><span style="${s.quoteMark}">“</span>${block.html}</blockquote>`
      if (block.type === 'unordered-list') return renderList(block.items ?? [], false)
      if (block.type === 'ordered-list') return renderList(block.items ?? [], true)
      return ''
    })
    .join('')

  const html = `<article data-brand-article="true" style="${s.article}">
    <header>
      <h1 style="${s.title}">${article.title}</h1>
      <div style="${s.meta}"><span style="${s.brand}">${article.brand}</span><span>${article.publishedAt}</span><span>${article.location}</span></div>
      <hr style="${s.divider}" />
    </header>
    <main>${body}</main>
    <footer style="${s.cta}">
      <h3 style="${s.ctaTitle}">从云端到边缘，释放 AI 的无限潜能</h3>
      <div style="${s.ctaRow}"><p style="${s.ctaText}">与 NVIDIA 一起，加速行业智能化升级</p><span style="${s.ctaButton}">了解更多解决方案 →</span></div>
    </footer>
  </article>`

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['article', 'header', 'main', 'footer', 'h1', 'h2', 'h3', 'div', 'span', 'hr', 'p', 'blockquote', 'ol', 'li', 'strong', 'em', 'code', 'br', 'a'],
    ALLOWED_ATTR: ['style', 'data-brand-article', 'href', 'title'],
  })
}

export function articlePlainText(article: ArticleDocument): string {
  const lines = [article.title, `${article.brand}  ${article.publishedAt}  ${article.location}`]
  for (const block of article.blocks) {
    if (block.type === 'title') continue
    if (block.items) lines.push(...block.items.map((item) => item.text))
    else lines.push(block.text)
  }
  lines.push('从云端到边缘，释放 AI 的无限潜能')
  return lines.filter(Boolean).join('\n\n')
}
