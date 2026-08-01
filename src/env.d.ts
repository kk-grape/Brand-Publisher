/// <reference types="vite/client" />

/** 仅声明环境变量类型；真实 API Key 必须放在被 Git 忽略的 .env.local。 */
interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: 'mock' | 'mimo'
  readonly VITE_AI_MOCK_FAILURE?: string
  readonly VITE_MIMO_API_KEY?: string
  readonly VITE_MIMO_BASE_URL?: string
  readonly VITE_MIMO_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
