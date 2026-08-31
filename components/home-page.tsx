import { SiteFooter } from '@/components/site-footer';
import { homeOptions } from '@/lib/layout.shared';
import { i18n, localePath, type Locale } from '@/lib/i18n';
import { projectConfig } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import { source } from '@/lib/source';
import { withBasePath } from '@/lib/site-path';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Braces,
  Github,
  Handshake,
  MessageSquareText,
  PlugZap,
  ServerCog,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';

const copy = {
  zh: {
    eyebrow: '面向子比主题开发者的公开资料库',
    title: '子比主题开发文档',
    description:
      '从真实主题源码出发，整理插件、子主题、Codestar Framework、主题扩展与本地开发工具。',
    read: '阅读文档',
    github: 'GitHub 仓库',
    browse: '浏览文档',
    browseDescription: '按当前任务进入对应资料，页面和源码都可以直接参与协作。',
    communityTitle: '一起维护这份文档',
    communityDescription:
      '发现错误、补充案例或申请友情链接，都可以通过 GitHub Issue 进入公开协作流程。',
    communityRead: '查看协作指南',
    issue: '提交文档反馈',
    announcement:
      '项目发布到 GitHub Pages，文档页面保持快速静态访问；反馈写入由独立 GitHub Bot 按需处理。',
    count: '篇公开文档',
    static: '静态发布',
    community: '社区协作',
  },
  en: {
    eyebrow: 'A public knowledge base for Zibll theme developers',
    title: 'Zibll Theme Docs',
    description:
      'Practical notes from real theme source code, covering plugins, child themes, Codestar Framework, extensions, and local tools.',
    read: 'Read the docs',
    github: 'GitHub repository',
    browse: 'Browse documentation',
    browseDescription:
      'Jump into the material for your current task and contribute through GitHub.',
    communityTitle: 'Maintain the docs together',
    communityDescription:
      'Report an error, add an example, or request a friend link through a public GitHub Issue.',
    communityRead: 'Read the contribution guide',
    issue: 'Send doc feedback',
    announcement:
      'The docs are published on GitHub Pages; a separate GitHub Bot handles feedback only when requested.',
    count: 'public documents',
    static: 'Static publishing',
    community: 'Community maintained',
  },
  ja: {
    eyebrow: '子比テーマ開発者向けの公開ナレッジベース',
    title: '子比テーマ開発ドキュメント',
    description:
      '実際のテーマソースをもとに、プラグイン、子テーマ、Codestar Framework、拡張とローカル開発ツールを整理しています。',
    read: 'ドキュメントを読む',
    github: 'GitHub リポジトリ',
    browse: 'ドキュメントを閲覧',
    browseDescription: '目的に合う資料へ進み、GitHub から共同で改善できます。',
    communityTitle: '一緒にドキュメントを改善',
    communityDescription:
      '誤りの報告、事例の追加、リンク掲載の申請は GitHub Issue から行えます。',
    communityRead: '協作ガイドを読む',
    issue: '文書フィードバック',
    announcement:
      'ドキュメントは GitHub Pages で公開し、フィードバックだけを独立した GitHub Bot が必要な時に処理します。',
    count: '件の公開ドキュメント',
    static: '静的公開',
    community: 'コミュニティ運営',
  },
} as const;

const sectionData = [
  { key: 'guide', icon: BookOpen },
  { key: 'framework', icon: Braces },
  { key: 'extensions', icon: ServerCog },
  { key: 'wpAi', icon: Bot },
  { key: 'tools', icon: PlugZap },
  { key: 'community', icon: UsersRound },
  { key: 'friends', icon: Handshake },
] as const;

const sectionCopy = {
  zh: {
    guide: ['使用指南', '从源码结构、学习路线和常见问题开始。', 'docs'],
    framework: [
      'Codestar Framework',
      '字段、Meta、后台设置与数据保存链路。',
      'docs/codestar-framework',
    ],
    extensions: [
      '主题扩展',
      'Hook、Ajax、用户、论坛、商城与 Zibpay。',
      'docs/api',
    ],
    wpAi: [
      'WordPress AI',
      'AI Client、Abilities API、Provider 与权限。',
      'docs/wp-ai',
    ],
    tools: [
      'MCP 与 Codex 插件',
      '把文档和源码参考接入本地开发工具。',
      'docs/mcp',
    ],
    community: [
      '社区协作',
      '通过 Issue、PR、交流群和公开规则一起维护文档。',
      'docs/community',
    ],
    friends: ['友情链接', '发现社区项目，并通过 Issue 申请收录。', 'friends'],
  },
  en: {
    guide: [
      'Getting Started',
      'Start with the source map, learning path, and FAQ.',
      'docs',
    ],
    framework: [
      'Codestar Framework',
      'Fields, Meta, admin options, and persistence.',
      'docs/codestar-framework',
    ],
    extensions: [
      'Theme Extensions',
      'Hooks, Ajax, users, forums, shops, and Zibpay.',
      'docs/api',
    ],
    wpAi: [
      'WordPress AI',
      'AI Client, Abilities API, providers, and permissions.',
      'docs/wp-ai',
    ],
    tools: [
      'MCP & Codex plugins',
      'Connect docs and source references to local tools.',
      'docs/mcp',
    ],
    community: [
      'Community',
      'Maintain docs through Issues, PRs, discussion, and shared rules.',
      'docs/community',
    ],
    friends: [
      'Friends',
      'Discover community projects and request a listing.',
      'friends',
    ],
  },
  ja: {
    guide: ['使用ガイド', 'ソース構成、学習ルート、FAQ から始めます。', 'docs'],
    framework: [
      'Codestar Framework',
      'フィールド、Meta、管理画面設定と保存処理。',
      'docs/codestar-framework',
    ],
    extensions: [
      'テーマ拡張',
      'Hook、Ajax、ユーザー、フォーラム、ショップ、Zibpay。',
      'docs/api',
    ],
    wpAi: [
      'WordPress AI',
      'AI Client、Abilities API、Provider と権限。',
      'docs/wp-ai',
    ],
    tools: [
      'MCP と Codex プラグイン',
      '資料とソースをローカルツールへ接続します。',
      'docs/mcp',
    ],
    community: [
      'コミュニティ',
      'Issue、PR、交流と公開ルールで資料を改善します。',
      'docs/community',
    ],
    friends: ['リンク', 'コミュニティのプロジェクトと掲載申請。', 'friends'],
  },
} as const;

export function HomePage({
  locale = i18n.defaultLanguage,
}: {
  locale?: Locale;
}) {
  const t = copy[locale];
  const documents = sectionCopy[locale];
  const documentCount = source.getPages(i18n.defaultLanguage).length;

  return (
    <HomeLayout {...homeOptions(locale)}>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <a
          href={projectConfig.announcementUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="border-fd-border bg-fd-muted/30 text-fd-muted-foreground hover:text-fd-foreground mb-6 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm transition-colors"
        >
          <span>{t.announcement}</span>
          <ArrowRight className="size-4 shrink-0" />
        </a>

        <section className="border-fd-border bg-fd-card/35 grid overflow-hidden rounded-xl border lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-fd-primary text-sm font-medium">{t.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">
              {t.title}
            </h1>
            <p className="text-fd-muted-foreground mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {t.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={localePath(locale, 'docs')}
                className="bg-fd-primary text-fd-primary-foreground inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90"
              >
                <BookOpen className="size-4" />
                {t.read}
              </Link>
              <a
                href={projectConfig.repositoryUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="border-fd-border hover:bg-fd-accent inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
              >
                <Github className="size-4" />
                {t.github}
              </a>
            </div>
          </div>
          <div className="border-fd-border bg-fd-muted/25 border-t p-4 lg:border-s lg:border-t-0 lg:p-6">
            <div className="border-fd-border bg-fd-background overflow-hidden rounded-lg border shadow-sm">
              <img
                src={withBasePath('/assets/home/docs-preview.png')}
                alt="子比主题开发文档页面预览"
                width={1100}
                height={720}
                className="h-auto w-full object-cover object-top"
                loading="eager"
              />
            </div>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="browse-heading">
          <div className="mb-5">
            <h2
              id="browse-heading"
              className="text-xl font-semibold sm:text-2xl"
            >
              {t.browse}
            </h2>
            <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
              {t.browseDescription}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectionData.map(({ key, icon: Icon }) => {
              const [itemTitle, itemDescription, path] = documents[key];
              return (
                <Link
                  key={key}
                  href={localePath(locale, path)}
                  className="border-fd-border bg-fd-card hover:border-fd-foreground/25 hover:bg-fd-accent/45 group rounded-lg border p-5 transition-colors"
                >
                  <Icon className="text-fd-muted-foreground size-5" />
                  <h3 className="mt-5 font-medium">{itemTitle}</h3>
                  <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
                    {itemDescription}
                  </p>
                  <ArrowRight className="text-fd-muted-foreground mt-4 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-fd-border mt-14 flex flex-col gap-5 border-y py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageSquareText className="size-5" />
              {t.communityTitle}
            </h2>
            <p className="text-fd-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              {t.communityDescription}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={localePath(locale, 'docs/community')}
              className="border-fd-border hover:bg-fd-accent inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
            >
              {t.communityRead}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={localePath(locale, 'docs/community/feedback')}
              className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity"
            >
              {t.issue}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <div className="text-fd-muted-foreground mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <span>
            {documentCount} {t.count}
          </span>
          <span aria-hidden="true">/</span>
          <span>{t.static}</span>
          <span aria-hidden="true">/</span>
          <span>{t.community}</span>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </HomeLayout>
  );
}
