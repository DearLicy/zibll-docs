import { DocPage, docMetadata } from '@/components/docs/doc-page';
import { i18n, type Locale } from '@/lib/i18n';
import { source } from '@/lib/source';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamicParams = false;

export function generateStaticParams() {
  return source
    .getLanguages()
    .filter(({ language }) => language !== i18n.defaultLanguage)
    .flatMap(({ language, pages }) =>
      pages.map((page) => ({
        lang: language,
        slug: page.slugs,
      })),
    );
}

export default async function LocaleDocPage({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { lang, slug } = await params;
  if (
    !i18n.languages.includes(lang as Locale) ||
    lang === i18n.defaultLanguage
  ) {
    notFound();
  }
  return <DocPage slug={slug} locale={lang as Locale} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (
    !i18n.languages.includes(lang as Locale) ||
    lang === i18n.defaultLanguage
  ) {
    notFound();
  }
  return docMetadata(slug, lang as Locale);
}
