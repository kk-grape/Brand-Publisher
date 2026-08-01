import { toPng } from 'html-to-image'
import type { ArticleDocument } from '../types/article'
import { serializeArticle } from './serializeArticle'

function download(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function exportArticleHtml(article: ArticleDocument): void {
  const content = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(article.title)}</title></head><body style="margin:0;background:#ffffff;">${serializeArticle(article)}</body></html>`
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  download(url, `${safeFilename(article.title)}.html`)
  URL.revokeObjectURL(url)
}

export async function exportArticlePng(element: HTMLElement, title: string): Promise<void> {
  const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
  download(dataUrl, `${safeFilename(title)}.png`)
}

function safeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60) || 'brand-article'
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}
