import { DocsLayoutClient } from '@/components/docs-layout-client';
import { i18n, type Locale } from '@/lib/i18n';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function LocaleDocsLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  if (
    !i18n.languages.includes(lang as Locale) ||
    lang === i18n.defaultLanguage
  ) {
    notFound();
  }

  const locale = lang as Locale;
  return (
    <DocsLayoutClient tree={source.getPageTree(locale)} locale={locale}>
      {children}
    </DocsLayoutClient>
  );
}
