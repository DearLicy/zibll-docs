import { HomePage } from '@/components/home-page';
import { i18n, type Locale } from '@/lib/i18n';
import { projectConfig, siteUrl as publicSiteUrl } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const localizedHomeMetadata: Record<
  Exclude<Locale, 'zh'>,
  { title: string; description: string; locale: string }
> = {
  en: {
    title: 'Zibll Theme Docs | WordPress Development, MCP & Codex Plugins',
    description:
      'A community-maintained knowledge base for Zibll theme, WordPress plugins, child themes, Codestar Framework, MCP and Codex plugins.',
    locale: 'en_US',
  },
  ja: {
    title: '子比テーマ開発ドキュメント | WordPress、MCP、Codex プラグイン',
    description:
      '子比テーマ、WordPress プラグイン、子テーマ、Codestar Framework、MCP と Codex プラグインのコミュニティドキュメント。',
    locale: 'ja_JP',
  },
};

export default async function LocaleHomePage({
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
  return <HomePage locale={lang as Locale} />;
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

  const value = localizedHomeMetadata[lang as Exclude<Locale, 'zh'>];
  const url = publicSiteUrl(`/${lang}`);
  return {
    title: { absolute: value.title },
    description: value.description,
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': projectConfig.siteUrl,
        en: publicSiteUrl('/en'),
        ja: publicSiteUrl('/ja'),
        'x-default': projectConfig.siteUrl,
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: siteSettings.siteName,
      title: value.title,
      description: value.description,
      locale: value.locale,
      images: [
        {
          url: publicSiteUrl(siteSettings.favicon),
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: value.title,
      description: value.description,
      images: [publicSiteUrl(siteSettings.favicon)],
    },
  };
}
