/** 使用统一文章结构生成确定性质量提示；Markdown 与 AI 结果共用同一套规则。 */
import type { ArticleDocument, QualityResult } from '../types/article'

export function runQualityChecks(source: string, article: ArticleDocument): QualityResult[] {
  if (!source.trim()) return []
  const paragraphs = article.blocks.filter((block) => block.type === 'paragraph')
  const headings = article.blocks.filter((block) => block.type === 'heading')
  const longParagraphs = paragraphs.filter((block) => block.text.length > 150)
  const levels = headings.map((block) => block.level ?? 2)
  const hasBadLevel = levels.some((level, index) => index > 0 && level - levels[index - 1] > 1)
  const hasTitle = article.blocks.some((block) => block.type === 'title' && block.text.trim())
  const hasQuote = article.blocks.some((block) => block.type === 'quote')
  const listCount = article.blocks.reduce((total, block) => total + (block.items?.length ?? 0), 0)
  const highlights = article.blocks.reduce((total, block) => {
    if (block.items) {
      return total + block.items.reduce((itemTotal, item) => itemTotal + (item.html.match(/<strong\b/g) ?? []).length, 0)
    }
    return total + (block.html.match(/<strong\b/g) ?? []).length
  }, 0)
  let consecutiveLong = false
  let streak = 0
  // 连续两个超过 150 字的正文块会明显降低公众号阅读节奏。
  for (const block of article.blocks) {
    streak = block.type === 'paragraph' && block.text.length > 150 ? streak + 1 : 0
    if (streak >= 2) consecutiveLong = true
  }

  return [
    {
      id: 'title', status: hasTitle ? 'success' : 'error',
      title: hasTitle ? '文章主标题完整' : '缺少文章主标题',
      description: hasTitle ? '已识别明确的文章主标题' : '请补充明确标题后重新排版',
    },
    {
      id: 'headings', status: headings.length >= 2 ? 'success' : 'warning',
      title: `已识别 ${headings.length} 个小标题`,
      description: headings.length >= 2 ? '结构清晰，便于读者浏览' : '建议增加 2—4 个小标题',
    },
    {
      id: 'long', status: longParagraphs.length ? 'warning' : 'success',
      title: longParagraphs.length ? `${longParagraphs.length} 个段落较长` : '段落长度舒适',
      description: longParagraphs.length ? '超过 150 字的段落建议拆分' : '未发现超过 150 字的段落',
    },
    {
      id: 'levels', status: hasBadLevel ? 'error' : 'success',
      title: hasBadLevel ? '标题层级存在跳级' : '标题层级合理',
      description: hasBadLevel ? '建议调整小标题的层级关系' : '标题结构连续且易于理解',
    },
    {
      id: 'quote', status: hasQuote ? 'success' : 'warning',
      title: hasQuote ? '已识别引用内容' : '未发现引用内容',
      description: hasQuote ? '引用将使用品牌强调样式' : '可将核心观点设置为引用',
    },
    {
      id: 'focus', status: listCount || highlights ? 'success' : 'warning',
      title: `重点信息 ${listCount + highlights} 处`,
      description: listCount || highlights ? `包含 ${listCount} 个要点、${highlights} 处重点` : '可通过列表或重点样式增强层次',
    },
    {
      id: 'continuous', status: consecutiveLong ? 'warning' : 'success',
      title: consecutiveLong ? '存在连续长段落' : '阅读节奏良好',
      description: consecutiveLong ? '建议在长段落间加入小标题或引用' : '未发现连续多个长段落',
    },
  ]
}
