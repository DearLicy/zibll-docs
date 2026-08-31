import './global.css';

import { SiteProvider } from '@/components/site-provider';
import { projectConfig, siteUrl as publicSiteUrl } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(projectConfig.siteUrl),
  applicationName: siteSettings.siteName,
  title: {
    default: siteSettings.defaultTitle,
    template: siteSettings.titleTemplate,
  },
  description: siteSettings.description,
  keywords: siteSettings.keywords,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: siteSettings.siteName,
    title: siteSettings.defaultTitle,
    description: siteSettings.description,
    url: projectConfig.siteUrl,
    images: [{ url: publicSiteUrl(siteSettings.favicon) }],
  },
  twitter: {
    card: 'summary',
    title: siteSettings.defaultTitle,
    description: siteSettings.description,
    images: [publicSiteUrl(siteSettings.favicon)],
  },
  alternates: {
    canonical: projectConfig.siteUrl,
    languages: {
      'zh-CN': projectConfig.siteUrl,
      en: publicSiteUrl('/en'),
      ja: publicSiteUrl('/ja'),
      'x-default': projectConfig.siteUrl,
    },
  },
  icons: {
    icon: [{ url: publicSiteUrl(siteSettings.favicon) }],
    shortcut: [publicSiteUrl(siteSettings.favicon)],
    apple: [{ url: publicSiteUrl(siteSettings.favicon) }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
