'use client';

import { localeOptions, uiTranslations } from '@/lib/ui-translations';
import { i18n, type Locale } from '@/lib/i18n';
import { withBasePath } from '@/lib/site-path';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

function pathnameLocale(pathname: string | null): Locale {
  const segment = pathname?.split('/').filter(Boolean)[0];
  return i18n.languages.includes(segment as Locale)
    ? (segment as Locale)
    : i18n.defaultLanguage;
}

function localizedPath(pathname: string | null, current: Locale, next: Locale) {
  const path = pathname || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === current) parts.shift();
  const clean = `/${parts.join('/')}`.replace(/\/$/, '') || '/';
  return withBasePath(
    next === i18n.defaultLanguage
      ? clean
      : `/${next}${clean === '/' ? '' : clean}`,
  );
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathnameLocale(pathname);

  return (
    <RootProvider
      search={{
        options: {
          type: 'static',
        },
      }}
      i18n={{
        locale,
        locales: localeOptions,
        translations: uiTranslations[locale],
        onLocaleChange(next) {
          router.push(localizedPath(pathname, locale, next as Locale));
        },
      }}
    >
      {children}
    </RootProvider>
  );
}
