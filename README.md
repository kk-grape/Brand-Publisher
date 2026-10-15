# 品牌公众号排版器

一个把普通文章或 Markdown 快速转换为 NVIDIA 品牌公众号富文本的前端工具，覆盖结构识别、品牌预览、质量检查、复制和导出完整流程。

## 核心功能

- Markdown 识别排版：直接解析标题、段落、引用、有序/无序列表和加粗重点
- AI 智能排版：MiMo 将整篇原文整理为 Markdown，再复用本地解析器生成统一的 `ArticleDocument`
- AI 安全检查：当前阻止 HTML、链接、图片、代码块及产品不支持的 Markdown 语法
- NVIDIA 官方模板和手机/电脑预览
- 标题层级、长段落、引用、列表与重点信息的动态质量检查
- 同时写入 `text/html` 和 `text/plain` 的公众号富文本复制
- 导出包含内联样式的 HTML 文件或文章主体 PNG
- 示例文章、完整重置、操作 Toast 和本地自动保存
- 桌面双栏与小屏上下布局

## 详细文档

- [产品说明](docs/product-overview.md)：项目解决什么问题、面向谁以及 MVP 范围
- [使用指南](docs/user-guide.md)：两种排版方式、预览、检查、复制和导出操作
- [技术架构](docs/architecture.md)：统一数据流、核心类型、AI 服务与公众号兼容方案
- [开发说明与当前进度](docs/development-notes.md)：技术决策、已知限制和后续开发建议

## 技术栈

- Vue 3 + TypeScript + Vite
- Composition API
- markdown-it
- DOMPurify
- lucide-vue-next
- html-to-image
- 原生 CSS

## 项目目录

```text
src/
  components/       页面与交互组件
  data/             演示文章
  services/         MiMo 请求、AI Markdown 校验与 Mock 实现
  templates/        NVIDIA 模板与主题
  types/            文章和质量检查类型
  utils/            解析、检查、复制和导出逻辑
  App.vue            状态编排与自动保存
  main.ts            应用入口
  styles.css         全局视觉与响应式样式
```

## 安装和运行

```bash
npm install
npm run dev
```

Vite 会在终端中显示本地访问地址，通常为 `http://localhost:5173`。

默认使用 Mock 模式。如需在本机连接 MiMo，请复制 `.env.example` 为 `.env.local` 并配置：

```env
VITE_AI_PROVIDER=mimo
VITE_MIMO_API_KEY=你的本机演示密钥
VITE_MIMO_BASE_URL=https://api.xiaomimimo.com/v1
VITE_MIMO_MODEL=mimo-v2.5-pro
```

`.env.local` 已被 Git 忽略。Vite 环境变量仍会出现在浏览器运行代码中，因此该接入方式只适用于本机或受控演示，不能用于公开部署共享密钥。

## 构建

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。

开发阶段如需验证 AI 失败提示与重试流程，可设置 `VITE_AI_MOCK_FAILURE=true` 后启动项目；默认不启用失败模式，以保证演示稳定。

## 公众号复制原理

排版结果通过统一的序列化器生成只使用内联 `style` 的 HTML，并在写入剪贴板前由 DOMPurify 过滤。预览、复制与 HTML 导出共用同一份公众号兼容结构，主要使用 `section`、`p` 和 `span`，避免依赖 Flex、复杂定位和外部 CSS。支持现代 Clipboard API 时，通过 `ClipboardItem` 同时写入 `text/html` 和 `text/plain`；不支持时，使用临时可编辑容器和浏览器复制命令降级。这样粘贴到微信公众号编辑器时，也能尽可能保留字号、颜色、行高、间距、引用框和品牌色。

## 当前版本的不足

- 当前只提供 NVIDIA 官方模板，没有模板编辑器
- 品牌、发布时间和地点暂不支持手动配置
- MiMo 使用浏览器直连方式，能否调用取决于接口的 CORS、网络、额度和密钥权限
- 浏览器端无法真正隐藏 MiMo API Key，当前方案只适用于本机演示
- 严格原文保真校验已经实现但暂未接入主流程。当前 MVP 优先保证排版成功率，MiMo
  返回结果只执行 Markdown 语法安全检查；后续需要先区分正文改动与标题、列表产生的
  结构标点变化，再恢复阻断式保真校验
- 富文本粘贴的最终效果仍可能受目标公众号编辑器的二次清理影响
- 没有后端、协作、云同步和账号系统
- 当前环境未预装 Playwright 浏览器，因此没有自动截图脚本；可以通过“示例文章 → Markdown 识别排版”手动完成演示

## 后续方向

- 增加更多品牌模板与可视化主题配置
- 继续优化 AI Markdown 的标题、引用、并列关系和加粗识别，但不加入润色或内容生成
- 支持图片上传、图文混排、模板收藏与品牌资产库
- 增加文章历史版本、多人协作和云端保存
- 增加自动化浏览器截图和端到端测试

## AI 在开发过程中的使用

AI 用于需求拆解、组件结构设计、规则设计、代码实现和构建问题排查。产品运行时的 Markdown 模式直接使用本地解析器；AI 模式可选择 MiMo 或离线 Mock。MiMo 负责给整篇原文增加 Markdown 排版标记，前端完成语法安全检查后，再调用与 Markdown 按钮相同的 `parseArticle()`。严格原文保真校验代码目前保留但未接入主流程。AI 返回的 Markdown 只用于预览，不会覆盖左侧原文。
