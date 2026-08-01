/** 预览宽度由 App 保存到 localStorage，并传给 ArticlePreview。 */
export type PreviewMode = 'mobile' | 'desktop'
export type TemplateId = 'nvidia-official'

/** 所有解析器都必须归一化成这组内容块类型，模板不关心解析来源。 */
export type BlockType =
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'unordered-list'
  | 'ordered-list'

export interface ArticleListItem {
  text: string
  html: string
}

/** 模板渲染的最小内容单元；html 已经过解析器约束，最终仍会由 DOMPurify 清洗。 */
export interface ArticleBlock {
  id: string
  type: BlockType
  text: string
  html: string
  level?: number
  items?: ArticleListItem[]
}

/** Markdown 与 AI 的统一输出，也是预览、复制和导出的唯一文章输入。 */
export interface ArticleDocument {
  title: string
  blocks: ArticleBlock[]
  brand: string
  publishedAt: string
  location: string
}

/** 编辑区实时摘要，不等同于右侧完整质量检查。 */
export interface ArticleStats {
  characters: number
  headings: number
  quotes: number
  lists: number
  listItems: number
  highlights: number
}

export type QualityStatus = 'success' | 'warning' | 'error'

/** 每条质量检查包含稳定 id、严重程度和展示文案。 */
export interface QualityResult {
  id: string
  status: QualityStatus
  title: string
  description: string
}

/** 品牌模板注册信息；当前只开放 NVIDIA，结构可继续扩展。 */
export interface BrandTemplate {
  id: TemplateId
  name: string
  brand: string
  accent: string
}

/** 顶部模板下拉菜单使用的展示数据，disabled 项不会改变当前模板。 */
export interface TemplateMenuItem {
  id: string
  name: string
  description: string
  logo?: string
  disabled?: boolean
  badge?: string
}
