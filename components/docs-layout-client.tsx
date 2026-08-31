'use client';

import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';
import { i18n, type Locale } from '@/lib/i18n';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export function DocsLayoutClient({
  tree,
  children,
  locale = i18n.defaultLanguage,
}: {
  tree: Root;
  children: ReactNode;
  locale?: Locale;
}) {
  return (
    <DocsLayout
      {...baseOptions(locale)}
      tabMode="top"
      tree={tree}
      sidebar={{
        defaultOpenLevel: 0,
      }}
    >
      {children}
      <SiteFooter locale={locale} />
    </DocsLayout>
  );
}
