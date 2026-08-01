export type PreviewMode = 'mobile' | 'desktop'
export type TemplateId = 'nvidia-official'
export type BlockType =
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'unordered-list'
  | 'ordered-list'

export interface ArticleBlock {
  id: string
  type: BlockType
  text: string
  html: string
  level?: number
  items?: Array<{ text: string; html: string }>
}

export interface ArticleDocument {
  title: string
  blocks: ArticleBlock[]
  brand: string
  publishedAt: string
  location: string
}

export interface ArticleStats {
  characters: number
  headings: number
  quotes: number
  lists: number
  listItems: number
  highlights: number
}

export type QualityStatus = 'success' | 'warning' | 'error'

export interface QualityResult {
  id: string
  status: QualityStatus
  title: string
  description: string
}

export interface BrandTemplate {
  id: TemplateId
  name: string
  brand: string
  accent: string
}

export interface TemplateMenuItem {
  id: string
  name: string
  description: string
  logo?: string
  disabled?: boolean
  badge?: string
}
