import { projectConfig } from '@/lib/project-config';

export type SiteSettings = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  logoLight: string;
  logoDark: string;
  favicon: string;
};

export type SponsorSettings = {
  enabled: boolean;
  intro: string;
  wechatQrUrl: string;
  alipayQrUrl: string;
  usdtTrc20Address: string;
  usdtQrUrl: string;
  tokenSponsorEnabled: boolean;
  domesticModel: 'deepseek';
  foreignModels: string[];
};

export const siteSettings: SiteSettings = {
  siteName: '子比主题开发文档',
  siteUrl: projectConfig.siteUrl,
  defaultTitle: '子比主题开发文档',
  titleTemplate: '%s | 子比主题开发文档',
  description:
    '由社区共同维护的子比主题二次开发文档，覆盖插件、子主题、Codestar Framework、MCP 与 Codex 插件。',
  keywords:
    '子比主题,WordPress,开发文档,插件开发,子主题,Codestar Framework,MCP,Codex',
  logoLight: '/assets/brand/logo-light.svg',
  logoDark: '/assets/brand/logo-dark.svg',
  favicon: '/assets/brand/favicon.svg',
};

export const sponsorSettings: SponsorSettings = {
  enabled: true,
  intro:
    '子比主题是面向用户级产品，作者不会投入大量精力维护完整开发文档。因此由李初一为开发者和需要二次开发的用户提供这套开发文档。目前文档仍在持续完善，已有 token 使用量达到 12 亿并超过预算。收到的赞助会全部用于购买 DeepSeek、ChatGPT 和 Claude token，继续蒸馏更多子比主题数据，完善本站知识库储备和开发文档数据中心。',
  wechatQrUrl: '/assets/sponsor/wechat-qr.png',
  alipayQrUrl: '/assets/sponsor/alipay-qr.png',
  usdtTrc20Address: 'TKu7SNWrmi3n1n6e8FJDgPAwe8oGrxXHvP',
  usdtQrUrl: '/assets/sponsor/usdt-trc20-qr.png',
  tokenSponsorEnabled: true,
  domesticModel: 'deepseek',
  foreignModels: ['chatgpt', 'claude'],
};
