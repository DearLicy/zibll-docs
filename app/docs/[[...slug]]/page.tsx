import { DocPage, docMetadata } from '@/components/docs/doc-page';
import { i18n } from '@/lib/i18n';
import { source } from '@/lib/source';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return source.getPages(i18n.defaultLanguage).map((page) => ({
    slug: page.slugs,
  }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <DocPage slug={slug} />;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return docMetadata(slug, i18n.defaultLanguage);
}
