import { i18n, type Locale } from '@/lib/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages
    .filter((locale) => locale !== i18n.defaultLanguage)
    .map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!i18n.languages.includes(lang as Locale)) notFound();

  return {
    alternates: {
      canonical: `/${lang}`,
    },
  };
}

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  if (!i18n.languages.includes(lang as Locale)) notFound();
  return children;
}
