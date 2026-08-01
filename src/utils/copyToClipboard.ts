/** 将同一篇文章同时复制为富文本 HTML 和纯文本备用内容。 */
import type { ArticleDocument } from '../types/article'
import { articlePlainText, serializeArticle } from './serializeArticle'

export async function copyArticle(article: ArticleDocument): Promise<void> {
  const html = serializeArticle(article)
  const text = articlePlainText(article)

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    // 现代浏览器路径：公众号编辑器可读取 text/html 并保留内联样式。
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    })
    await navigator.clipboard.write([item])
    return
  }

  // 兼容旧浏览器：临时选中一个不可见的富文本节点，再调用 execCommand。
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
  // 无论复制结果如何，都及时清理 Selection 和临时 DOM。
  selection?.removeAllRanges()
  container.remove()
  if (!copied) throw new Error('浏览器拒绝了剪贴板操作')
}
