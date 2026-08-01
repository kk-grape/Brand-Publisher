/** NVIDIA 模板注册信息和公众号可复制的内联样式配置。 */
import type { BrandTemplate } from '../types/article'

export const nvidiaTemplate: BrandTemplate = {
  id: 'nvidia-official',
  name: 'NVIDIA 官方模板',
  brand: 'NVIDIA 英伟达',
  accent: '#76B900',
}

export const templates: BrandTemplate[] = [nvidiaTemplate]

// 这里使用保守的内联 style，而不是 CSS 类和复杂网页布局。
// 微信编辑器会二次清理粘贴内容，因此尽量只依赖边框、间距、颜色和 table 布局。
export const articleStyles = {
  article: "display:block;margin:0 auto;padding:34px 32px 28px;background:#ffffff;color:#333333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',Arial,sans-serif;word-break:break-word;overflow-wrap:break-word;",
  titleAccent: 'display:block;margin:0 0 12px;font-size:0;line-height:0;',
  titleAccentGreen: "display:inline-block;margin:0 6px 0 0;color:#76B900;font-family:Arial,sans-serif;font-size:18px;line-height:0.75;font-weight:700;letter-spacing:-3px;vertical-align:middle;white-space:nowrap;",
  titleAccentBlack: "display:inline-block;color:#151515;font-family:Arial,sans-serif;font-size:18px;line-height:0.75;font-weight:700;vertical-align:middle;white-space:nowrap;",
  title: 'margin:0 0 30px;color:#111111;font-size:30px;line-height:1.34;font-weight:700;letter-spacing:0;',
  headingWrap: 'display:block;margin:28px 0 16px;text-align:center;',
  subheadingWrap: 'display:block;margin:23px 0 14px;text-align:center;',
  headingLineOuter: 'display:inline-block;padding:0 8px 3px;border-bottom:3px solid #76B900;',
  headingLineInner: 'display:inline-block;padding:0 0 4px;border-bottom:3px solid #161816;',
  heading: 'display:inline;color:#67A900;font-size:20px;line-height:1.45;font-weight:700;letter-spacing:0;',
  subheading: 'display:inline-block;margin:0;padding:6px 15px;border:1px solid #76B900;border-radius:4px;background:#FFFFFF;color:#151515;font-size:15px;line-height:1.5;font-weight:700;letter-spacing:0;',
  paragraph: 'margin:0 0 16px;color:#333333;font-size:15px;line-height:1.95;letter-spacing:0.12px;text-align:justify;',
  quotedText: 'color:#67A900;font-weight:700;',
  quote: 'display:block;margin:18px 0 22px;padding:14px 18px;border-left:3px solid #76B900;border-radius:8px;background:#f1f4ef;color:#40453d;font-size:15px;line-height:1.8;',
  quoteMark: 'display:inline;margin:0 8px 0 0;color:#76B900;font-size:24px;line-height:1;font-weight:700;vertical-align:-2px;',
  list: 'display:block;margin:16px 0 20px;padding:12px 16px;border-radius:8px;background:#f5f7f4;',
  listItem: 'display:table;width:100%;margin:0;padding:6px 0;color:#333333;font-size:14px;line-height:1.75;table-layout:fixed;',
  markerCell: 'display:table-cell;width:36px;vertical-align:middle;',
  orderedMarkerCell: 'display:table-cell;width:28px;vertical-align:top;',
  listText: 'display:table-cell;vertical-align:middle;',
  orderedListText: 'display:table-cell;vertical-align:top;',
  unorderedMarker: "display:inline-block;width:24px;height:24px;border:1px solid #76B900;border-radius:8px;background:#76B900;color:#FFFFFF;font-family:Arial,sans-serif;font-size:16px;line-height:22px;font-weight:600;text-align:center;vertical-align:middle;white-space:nowrap;",
  orderedMarker: 'display:inline-block;width:22px;color:#67A900;font-size:13px;line-height:1.75;font-weight:700;text-align:center;',
  sectionDivider: "display:block;margin:25px 0 4px;font-family:Arial,sans-serif;font-size:10px;line-height:1;text-align:center;white-space:nowrap;",
  sectionLine: 'display:inline;color:#DCEBC8;letter-spacing:-1px;',
  sectionDiamond: 'display:inline;margin:0 8px;color:#A9CC78;font-size:13px;line-height:1;',
  cta: 'margin:28px 0 0;padding:22px 24px;border-radius:10px;background:#101211;color:#ffffff;',
  ctaTitle: 'margin:0 0 7px;color:#ffffff;font-size:18px;line-height:1.5;font-weight:700;',
  ctaText: 'margin:0;color:#b7bdb7;font-size:13px;line-height:1.7;',
  ctaAction: 'margin:14px 0 0;text-align:right;',
  ctaButton: 'display:inline-block;padding:10px 15px;border-radius:5px;background:#76B900;color:#ffffff;font-size:13px;line-height:1.3;font-weight:700;text-decoration:none;',
} as const
