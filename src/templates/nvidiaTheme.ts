import type { BrandTemplate } from '../types/article'

export const nvidiaTemplate: BrandTemplate = {
  id: 'nvidia-official',
  name: 'NVIDIA 官方模板',
  brand: 'NVIDIA 英伟达',
  accent: '#76B900',
}

export const templates: BrandTemplate[] = [nvidiaTemplate]

export const articleStyles = {
  article: "box-sizing:border-box;width:100%;margin:0 auto;padding:34px 32px 28px;background:#ffffff;color:#333333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',Arial,sans-serif;",
  title: 'margin:0 0 14px;color:#111111;font-size:30px;line-height:1.32;font-weight:800;letter-spacing:-0.4px;',
  meta: 'display:flex;flex-wrap:wrap;gap:7px 18px;margin:0 0 20px;color:#7c8491;font-size:13px;line-height:1.6;',
  brand: 'color:#67aa00;font-weight:600;',
  divider: 'height:1px;margin:0 0 24px;background:#e7e9e8;border:0;',
  heading: 'margin:26px 0 12px;padding-left:12px;border-left:5px solid #76B900;color:#151515;font-size:20px;line-height:1.45;font-weight:750;',
  subheading: 'margin:22px 0 10px;padding-left:11px;border-left:3px solid #76B900;color:#222222;font-size:17px;line-height:1.5;font-weight:700;',
  paragraph: 'margin:0 0 16px;color:#333333;font-size:15px;line-height:1.95;letter-spacing:0.12px;text-align:justify;',
  quote: 'position:relative;margin:18px 0 22px;padding:14px 18px 14px 44px;border-radius:9px;background:#f1f4ef;color:#40453d;font-size:15px;line-height:1.8;',
  quoteMark: 'position:absolute;left:15px;top:6px;color:#76B900;font-size:31px;line-height:1;font-weight:800;',
  list: 'list-style:none;margin:16px 0 22px;padding:13px 16px;border-radius:10px;background:#f3f6f2;',
  listItem: 'display:flex;align-items:flex-start;gap:12px;margin:0;padding:7px 0;color:#333333;font-size:14px;line-height:1.7;',
  bullet: 'display:inline-flex;flex:none;align-items:center;justify-content:center;width:22px;height:22px;margin-top:1px;border-radius:6px;background:#76B900;color:#ffffff;font-size:12px;font-weight:800;',
  cta: 'margin:28px 0 0;padding:22px 24px;border-radius:10px;background:#101211;color:#ffffff;',
  ctaTitle: 'margin:0 0 7px;color:#ffffff;font-size:18px;line-height:1.5;font-weight:700;',
  ctaRow: 'display:flex;align-items:center;justify-content:space-between;gap:18px;',
  ctaText: 'margin:0;color:#b7bdb7;font-size:13px;line-height:1.7;',
  ctaButton: 'display:inline-block;flex:none;padding:10px 15px;border-radius:5px;background:#76B900;color:#ffffff;font-size:13px;line-height:1.3;font-weight:700;text-decoration:none;',
} as const
