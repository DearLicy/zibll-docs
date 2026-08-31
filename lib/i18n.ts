import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'zh',
  languages: ['zh', 'en', 'ja'],
  parser: 'dir',
  hideLocale: 'default-locale',
  fallbackLanguage: 'zh',
});

export type Locale = (typeof i18n.languages)[number];

export const localeNames: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
  ja: '日本語',
};

export function localePath(locale: Locale, path = '') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  if (locale === i18n.defaultLanguage) return cleanPath ? `/${cleanPath}` : '/';
  return cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`;
}
