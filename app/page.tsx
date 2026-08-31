import { HomePage } from '@/components/home-page';
import { projectConfig, siteUrl as publicSiteUrl } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: '子比主题开发文档 | WordPress 开发、MCP 与 Codex 插件' },
  description: siteSettings.description,
  alternates: {
    canonical: projectConfig.siteUrl,
    languages: {
      'zh-CN': projectConfig.siteUrl,
      en: publicSiteUrl('/en'),
      ja: publicSiteUrl('/ja'),
      'x-default': projectConfig.siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: projectConfig.siteUrl,
    siteName: siteSettings.siteName,
    title: '子比主题开发文档 | WordPress 开发、MCP 与 Codex 插件',
    description: siteSettings.description,
    images: [{ url: publicSiteUrl(siteSettings.favicon) }],
  },
};

export default function HomePageRoute() {
  return <HomePage />;
}
