import type { ArticleDocument } from '../types/article'
import { articlePlainText, serializeArticle } from './serializeArticle'

export async function copyArticle(article: ArticleDocument): Promise<void> {
  const html = serializeArticle(article)
  const text = articlePlainText(article)

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    })
    await navigator.clipboard.write([item])
    return
  }

  const container = document.createElement('div')
  container.contentEditable = 'true'
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.innerHTML = html
  document.body.appendChild(container)
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection?.removeAllRanges()
  selection?.addRange(range)
  const copied = document.execCommand('copy')
  selection?.removeAllRanges()
  container.remove()
  if (!copied) throw new Error('浏览器拒绝了剪贴板操作')
}
