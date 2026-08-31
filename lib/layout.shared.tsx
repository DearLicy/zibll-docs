import { SiteLogo } from '@/components/site-logo';
import { docsNavigationManifest } from '@/lib/routes';
import { i18n, localePath, type Locale } from '@/lib/i18n';
import { projectConfig } from '@/lib/project-config';
import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import {
  BookOpen,
  Boxes,
  Bot,
  Code2,
  ExternalLink,
  Handshake,
  Github,
  PlugZap,
  Settings2,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';

type NavigationCopy = {
  docs: string;
  docsDescription: string;
  guide: string;
  framework: string;
  extensions: string;
  wpAi: string;
  tools: string;
  sponsor: string;
  community: string;
  communityDescription: string;
  mcp: string;
  friends: string;
  contribute: string;
  browseAll: string;
};

const copy: Record<Locale, NavigationCopy> = {
  zh: {
    docs: '文档',
    docsDescription: '按分类浏览子比主题开发资料。',
    guide: '使用指南',
    framework: 'Codestar Framework',
    extensions: '主题扩展',
    wpAi: 'WP AI',
    tools: '开发工具',
    sponsor: '赞助打赏',
    community: '社区协作',
    communityDescription: '问题反馈、贡献文档、交流和友情链接申请。',
    mcp: 'MCP 与插件',
    friends: '友情链接',
    contribute: '参与共建',
    browseAll: '浏览全部分类',
  },
  en: {
    docs: 'Docs',
    docsDescription: 'Browse the WordPress and Zibll development guides.',
    guide: 'Getting Started',
    framework: 'Codestar Framework',
    extensions: 'Theme Extensions',
    wpAi: 'WP AI',
    tools: 'Developer Tools',
    sponsor: 'Support the project',
    community: 'Community',
    communityDescription:
      'Feedback, contributions, discussion, and friend links.',
    mcp: 'MCP & Plugins',
    friends: 'Friends',
    contribute: 'Contribute',
    browseAll: 'Browse all categories',
  },
  ja: {
    docs: 'ドキュメント',
    docsDescription: 'WordPress と Zibll の開発資料を分類別に閲覧します。',
    guide: '使用ガイド',
    framework: 'Codestar Framework',
    extensions: 'テーマ拡張',
    wpAi: 'WP AI',
    tools: '開発ツール',
    sponsor: '支援する',
    community: 'コミュニティ',
    communityDescription: 'フィードバック、貢献、交流、リンク掲載の申請。',
    mcp: 'MCP とプラグイン',
    friends: 'リンク',
    contribute: '参加する',
    browseAll: 'すべての分類を見る',
  },
};

const categoryIcons: Record<string, LucideIcon> = {
  guide: BookOpen,
  'codestar-framework': Settings2,
  api: Code2,
  'wp-ai': Bot,
  ai: Boxes,
  community: UsersRound,
  sponsor: Handshake,
};

function categoryTitle(id: string, value: NavigationCopy) {
  const titles: Record<string, string> = {
    guide: value.guide,
    'codestar-framework': value.framework,
    api: value.extensions,
    'wp-ai': value.wpAi,
    ai: value.tools,
    community: value.community,
    sponsor: value.sponsor,
  };
  return titles[id] || id;
}

const categoryDescriptions: Record<Locale, Record<string, string>> = {
  zh: {
    guide: copy.zh.docsDescription,
    'codestar-framework': '后台设置、字段、Meta 与数据保存链路。',
    api: '函数、Hook、Ajax、模板和业务扩展参考。',
    'wp-ai': 'AI Client、Abilities API 与 Provider 开发资料。',
    ai: 'MCP、Codex 插件和本地开发工具。',
    community: copy.zh.communityDescription,
    sponsor: '支持文档整理与知识库持续维护。',
  },
  en: {
    guide: copy.en.docsDescription,
    'codestar-framework': 'Admin options, fields, Meta, and persistence flows.',
    api: 'Functions, hooks, Ajax, templates, and feature extensions.',
    'wp-ai': 'AI Client, Abilities API, and provider development.',
    ai: 'MCP, Codex plugins, Skills, and local developer tools.',
    community: copy.en.communityDescription,
    sponsor: 'Support documentation maintenance and knowledge-base work.',
  },
  ja: {
    guide: copy.ja.docsDescription,
    'codestar-framework': '管理画面設定、フィールド、Meta と保存処理。',
    api: '関数、Hook、Ajax、テンプレートと機能拡張。',
    'wp-ai': 'AI Client、Abilities API と Provider 開発資料。',
    ai: 'MCP、Codex プラグイン、Skill とローカル開発ツール。',
    community: copy.ja.communityDescription,
    sponsor: 'ドキュメント整理とナレッジベースの維持を支援します。',
  },
};

function categoryDescription(
  id: string,
  locale: Locale,
  value: NavigationCopy,
) {
  return categoryDescriptions[locale][id] || value.docsDescription;
}

function localizedDocPath(locale: Locale, url: string) {
  return localePath(locale, url.replace(/^\/+/, ''));
}

/** Shared options for the documentation layout. The page tree owns the sidebar. */
export function baseOptions(
  locale: Locale = i18n.defaultLanguage,
): BaseLayoutProps {
  return {
    nav: {
      title: <SiteLogo />,
      url: localePath(locale),
    },
    githubUrl: projectConfig.repositoryUrl,
    themeSwitch: {
      enabled: true,
      mode: 'light-dark',
    },
    searchToggle: {
      enabled: true,
    },
  };
}

function MenuLinkItem({
  href,
  title,
  description,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <NavbarMenuLink href={href} className="text-[15px]">
      <Icon className="bg-fd-primary text-fd-primary-foreground mb-2 size-8 rounded-md p-1.5" />
      <p className="font-medium">{title}</p>
      <p className="text-fd-muted-foreground text-sm">{description}</p>
    </NavbarMenuLink>
  );
}

function DesktopDocsMenu({
  locale,
  value,
}: {
  locale: Locale;
  value: NavigationCopy;
}) {
  const docsUrl = localePath(locale, 'docs');
  const items = docsNavigationManifest.map((item) => ({
    href: localizedDocPath(locale, item.url),
    title: categoryTitle(item.id, value),
    description: categoryDescription(item.id, locale, value),
    Icon: categoryIcons[item.id] || PlugZap,
  }));

  return (
    <NavbarMenu>
      <NavbarMenuTrigger>
        <Link href={docsUrl}>{value.docs}</Link>
      </NavbarMenuTrigger>
      <NavbarMenuContent className="grid-cols-1 gap-1 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
        <NavbarMenuLink href={docsUrl} className="sm:row-span-2 lg:row-span-3">
          <div className="bg-fd-primary text-fd-primary-foreground mb-4 flex size-10 items-center justify-center rounded-lg">
            <BookOpen className="size-5" />
          </div>
          <p className="font-medium">{value.docs}</p>
          <p className="text-fd-muted-foreground mt-1 text-sm leading-6">
            {value.docsDescription}
          </p>
          <span className="text-fd-muted-foreground mt-5 inline-flex items-center gap-1 text-xs">
            {value.browseAll} <ExternalLink className="size-3" />
          </span>
        </NavbarMenuLink>
        {items.map((item) => (
          <MenuLinkItem key={item.href} {...item} />
        ))}
      </NavbarMenuContent>
    </NavbarMenu>
  );
}

/** Header links used by the homepage and the static friends page. */
export function homeOptions(locale: Locale = 'zh'): BaseLayoutProps {
  const value = copy[locale];
  const docsUrl = localePath(locale, 'docs');
  const mcpUrl = localePath(locale, 'docs/mcp');
  const communityUrl = localePath(locale, 'docs/community');
  const friendsUrl = localePath(locale, 'friends');

  const links: LinkItemType[] = [
    {
      type: 'menu',
      on: 'menu',
      text: value.docs,
      url: docsUrl,
      items: docsNavigationManifest.map((item) => {
        const Icon = categoryIcons[item.id] || PlugZap;
        return {
          type: 'main' as const,
          text: categoryTitle(item.id, value),
          url: localizedDocPath(locale, item.url),
          icon: <Icon />,
        };
      }),
    },
    {
      type: 'main',
      on: 'menu',
      text: value.mcp,
      url: mcpUrl,
      icon: <PlugZap />,
    },
    {
      type: 'main',
      on: 'menu',
      text: value.community,
      url: communityUrl,
      icon: <UsersRound />,
    },
    {
      type: 'main',
      on: 'menu',
      text: value.friends,
      url: friendsUrl,
      icon: <Handshake />,
    },
    {
      type: 'custom',
      on: 'nav',
      children: <DesktopDocsMenu locale={locale} value={value} />,
    },
    {
      type: 'main',
      on: 'nav',
      text: value.mcp,
      url: mcpUrl,
      icon: <PlugZap />,
    },
    {
      type: 'main',
      on: 'nav',
      text: value.community,
      url: communityUrl,
      icon: <UsersRound />,
    },
    {
      type: 'main',
      on: 'nav',
      text: value.friends,
      url: friendsUrl,
      icon: <Handshake />,
    },
    {
      type: 'button',
      on: 'nav',
      text: value.contribute,
      url: projectConfig.issuesUrl,
      external: true,
      secondary: true,
      icon: <Github />,
    },
  ];

  return {
    ...baseOptions(locale),
    links,
  };
}
