import { DocFeedback } from '@/components/docs/doc-feedback';
import { DocPageActions } from '@/components/docs/doc-page-actions';
import { getMDXComponents } from '@/components/mdx';
import { i18n, localePath, type Locale } from '@/lib/i18n';
import { siteUrl as publicSiteUrl } from '@/lib/project-config';
import { source } from '@/lib/source';
import { siteSettings } from '@/lib/static-config';
import { Card } from 'fumadocs-ui/components/card';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ComponentProps } from 'react';

function localizedHref(
  href: string,
  pageLocale: Locale,
  page: NonNullable<ReturnType<typeof source.getPage>>,
) {
  const resolved = href.startsWith('.') ? source.resolveHref(href, page) : href;
  const isLocalizedRoute =
    resolved.startsWith('/docs') || resolved.startsWith('/friends');
  if (pageLocale === i18n.defaultLanguage || !isLocalizedRoute) {
    return resolved;
  }
  if (resolved.startsWith(`/${pageLocale}/`)) return resolved;
  return `/${pageLocale}${resolved}`;
}

export async function DocPage({
  slug,
  locale = i18n.defaultLanguage,
}: {
  slug?: string[];
  locale?: Locale;
}) {
  const page = source.getPage(slug, locale) ?? notFound();

  const MDX = page.data.body;
  const markdownUrl = `${page.url}.mdx`;
  const sourcePath = `content/docs/${page.path.replaceAll('\\', '/')}`;
  const RelativeLink = createRelativeLink(source, page);

  function LocalizedLink(props: ComponentProps<'a'>) {
    const href =
      typeof props.href === 'string'
        ? localizedHref(props.href, locale, page)
        : props.href;
    return <RelativeLink {...props} href={href} />;
  }

  function LocalizedCard(props: ComponentProps<typeof Card>) {
    const href =
      typeof props.href === 'string'
        ? localizedHref(props.href, locale, page)
        : props.href;
    return <Card {...props} href={href} />;
  }

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        style: 'clerk',
      }}
      tableOfContentPopover={{
        enabled: false,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocPageActions
        markdownUrl={markdownUrl}
        sourcePath={sourcePath}
        pageUrl={page.url}
        locale={locale}
      />
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: LocalizedLink,
            Card: LocalizedCard,
          })}
        />
      </DocsBody>
      <DocFeedback title={page.data.title} locale={locale} />
    </DocsPage>
  );
}

export function docMetadata(
  slug: string[] | undefined,
  locale: Locale,
): Metadata {
  const page = source.getPage(slug, locale) ?? notFound();

  const pagePath =
    locale !== i18n.defaultLanguage && page.url.startsWith(`/${locale}/`)
      ? page.url.slice(locale.length + 1)
      : page.url;
  const canonicalPath = localePath(locale, pagePath);
  const canonicalUrl = publicSiteUrl(canonicalPath);
  const localizedUrls = {
    'zh-CN': publicSiteUrl(pagePath),
    en: publicSiteUrl(`/en${pagePath}`),
    ja: publicSiteUrl(`/ja${pagePath}`),
    'x-default': publicSiteUrl(pagePath),
  };
  const ogLocale =
    locale === 'en' ? 'en_US' : locale === 'ja' ? 'ja_JP' : 'zh_CN';

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: canonicalUrl,
      languages: localizedUrls,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      siteName: siteSettings.siteName,
      title: page.data.title,
      description: page.data.description,
      locale: ogLocale,
      images: [
        {
          url: publicSiteUrl(siteSettings.favicon),
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: page.data.title,
      description: page.data.description,
      images: [publicSiteUrl(siteSettings.favicon)],
    },
  };
}
