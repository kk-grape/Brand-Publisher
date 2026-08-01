/** 文章导出工具：HTML 导出复用序列化器，PNG 只截取传入的文章 DOM。 */
import { toPng } from 'html-to-image'
import type { ArticleDocument } from '../types/article'
import { serializeArticle } from './serializeArticle'

function download(url: string, filename: string): void {
  // 使用临时 a 标签触发浏览器下载，不需要服务端文件接口。
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
  // 释放临时 URL，避免多次导出持续占用浏览器内存。
  URL.revokeObjectURL(url)
}

export async function exportArticlePng(element: HTMLElement, title: string): Promise<void> {
  const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
  download(dataUrl, `${safeFilename(title)}.png`)
}

function safeFilename(value: string): string {
  // Windows 文件名不允许以下字符，空标题则使用稳定的备用名称。
  return value.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60) || 'brand-article'
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}
