import { FriendsPage } from '@/components/friends-page';
import { i18n, type Locale } from '@/lib/i18n';
import { siteUrl as publicSiteUrl } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function LocaleFriendsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (
    !i18n.languages.includes(lang as Locale) ||
    lang === i18n.defaultLanguage
  ) {
    notFound();
  }
  return <FriendsPage locale={lang as Locale} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (
    !i18n.languages.includes(lang as Locale) ||
    lang === i18n.defaultLanguage
  ) {
    notFound();
  }

  const locale = lang as Locale;
  const copy = {
    en: {
      title: 'Friends | Zibll Theme Docs',
      description:
        'Community projects and developer sites recommended by the Zibll documentation community.',
      locale: 'en_US',
    },
    ja: {
      title: 'リンク | 子比テーマ開発ドキュメント',
      description:
        '子比テーマ開発コミュニティが紹介するプロジェクトと開発者サイト。',
      locale: 'ja_JP',
    },
  }[locale as 'en' | 'ja'];
  const url = publicSiteUrl(`/${locale}/friends`);
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': publicSiteUrl('/friends'),
        en: publicSiteUrl('/en/friends'),
        ja: publicSiteUrl('/ja/friends'),
        'x-default': publicSiteUrl('/friends'),
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: siteSettings.siteName,
      title: copy.title,
      description: copy.description,
      locale: copy.locale,
      images: [
        {
          url: publicSiteUrl(siteSettings.favicon),
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: copy.title,
      description: copy.description,
      images: [publicSiteUrl(siteSettings.favicon)],
    },
  };
}
