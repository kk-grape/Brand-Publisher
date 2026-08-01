/**
 * AI Markdown 校验模块：语法安全检查已用于当前流程，原文保真检查暂时保留备用。
 * 校验通过后，Markdown 会直接交给现有 parseArticle()，不再维护第二套文章转换器。
 */
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: false })

const allowedBlockTokens = new Set([
  'heading_open', 'heading_close',
  'paragraph_open', 'paragraph_close',
  'blockquote_open', 'blockquote_close',
  'bullet_list_open', 'bullet_list_close',
  'ordered_list_open', 'ordered_list_close',
  'list_item_open', 'list_item_close',
  'inline',
])

const allowedInlineTokens = new Set([
  'text', 'strong_open', 'strong_close', 'softbreak', 'hardbreak',
])

/** 去掉模型偶尔包裹在最外层的 ```markdown 代码围栏。 */
export function extractAiMarkdown(content: unknown): string {
  if (typeof content !== 'string' || !content.trim()) throw new Error('AI 没有返回可用的 Markdown')
  const trimmed = content.trim()
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i)
  return (fenced?.[1] ?? trimmed).trim()
}

/**
 * 提取 Markdown 的可见文字，并去掉空白差异。
 * 标题、引用、列表和加粗标记不会进入结果，因此 AI 可以自由增加这些排版符号。
 */
export function markdownTextFingerprint(source: string): string {
  const visibleText: string[] = []
  for (const token of md.parse(source, {})) {
    if (token.type === 'inline') {
      for (const child of token.children ?? []) {
        if (child.type === 'text' || child.type === 'code_inline') visibleText.push(child.content)
        if (child.type === 'image') visibleText.push(child.content)
      }
    } else if (token.type === 'fence' || token.type === 'code_block' || token.type === 'html_block') {
      visibleText.push(token.content)
    }
  }
  return visibleText.join('').replace(/\s+/gu, '')
}

/** 只允许产品已经支持的 Markdown 子集，防止模型偷偷加入链接、HTML 或代码。 */
export function validateAiMarkdownSyntax(markdown: string): void {
  if (/<\/?[A-Za-z][^>]*>/.test(markdown)) throw new Error('AI 返回了不允许的 HTML')

  for (const token of md.parse(markdown, {})) {
    if (!allowedBlockTokens.has(token.type)) throw new Error(`AI 返回了不支持的 Markdown：${token.type}`)
    if (token.type === 'heading_open' && !['h1', 'h2', 'h3'].includes(token.tag)) {
      throw new Error('AI 只能使用一至三级标题')
    }
    if (token.type === 'inline') {
      const unsupported = (token.children ?? []).find((child) => !allowedInlineTokens.has(child.type))
      if (unsupported) throw new Error(`AI 返回了不支持的行内格式：${unsupported.type}`)
    }
  }
}

/**
 * 对比原文和 AI Markdown 的可见字符序列。
 * 任意改字、漏字、重复、标点变化或顺序调整都会导致指纹不同并拒绝更新预览。
 *
 * MVP 开发进度：
 * 1. 可见文字指纹提取、顺序比较和异常提示已经完成。
 * 2. 当前 MiMo 主流程暂不调用本函数，只执行 validateAiMarkdownSyntax()。
 * 3. 原因是模型把完整句子提升为标题或拆成列表时，偶尔会调整句号和序号，
 *    现阶段若严格拦截会显著影响演示成功率。
 * 4. 后续恢复前应先实现差异分级：正文、数字或顺序变化属于错误；仅结构标点
 *    变化应提示、自动修复或允许用户确认，然后再接回主流程。
 */
export function validateAiMarkdown(source: string, markdown: string): void {
  validateAiMarkdownSyntax(markdown)
  if (markdownTextFingerprint(source) !== markdownTextFingerprint(markdown)) {
    throw new Error('AI 返回的 Markdown 改变了原文内容或顺序')
  }
}
