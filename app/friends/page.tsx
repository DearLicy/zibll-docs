import { FriendsPage } from '@/components/friends-page';
import { siteUrl as publicSiteUrl } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '友情链接',
  description: `与${siteSettings.siteName}互相推荐的主题、插件、开发者和社区项目。`,
  alternates: {
    canonical: publicSiteUrl('/friends/'),
    languages: {
      'zh-CN': publicSiteUrl('/friends/'),
      en: publicSiteUrl('/en/friends/'),
      ja: publicSiteUrl('/ja/friends/'),
      'x-default': publicSiteUrl('/friends/'),
    },
  },
  openGraph: {
    type: 'website',
    url: publicSiteUrl('/friends/'),
    siteName: siteSettings.siteName,
    title: `友情链接 | ${siteSettings.siteName}`,
    description: `与${siteSettings.siteName}互相推荐的主题、插件、开发者和社区项目。`,
    locale: 'zh_CN',
    images: [
      {
        url: publicSiteUrl(siteSettings.favicon),
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `友情链接 | ${siteSettings.siteName}`,
    description: `与${siteSettings.siteName}互相推荐的主题、插件、开发者和社区项目。`,
    images: [publicSiteUrl(siteSettings.favicon)],
  },
};

export default function FriendsPageRoute() {
  return <FriendsPage />;
}
