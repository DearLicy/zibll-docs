import { localePath, type Locale } from '@/lib/i18n';
import { projectConfig } from '@/lib/project-config';
import { siteSettings } from '@/lib/static-config';
import { ExternalLink, Github, Handshake, MessageCircle } from 'lucide-react';
import Link from 'next/link';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterCopy = {
  sections: {
    about: { title: string; links: FooterLink[] };
    docs: { title: string; links: FooterLink[] };
    tools: { title: string; links: FooterLink[] };
    community: { title: string; links: FooterLink[] };
  };
  note: string;
  copyright: string;
  github: string;
  discussions: string;
  qq: string;
};

function localized(path: string, locale: Locale) {
  return localePath(locale, path);
}

function buildCopy(locale: Locale): FooterCopy {
  const external = (label: string, href: string): FooterLink => ({
    label,
    href,
    external: true,
  });
  const internal = (label: string, href: string): FooterLink => ({
    label,
    href,
  });

  if (locale === 'en') {
    return {
      sections: {
        about: {
          title: 'About',
          links: [
            internal('Project overview', 'docs'),
            internal('Community guide', 'docs/community'),
            external('Announcement', projectConfig.announcementUrl),
          ],
        },
        docs: {
          title: 'Documentation',
          links: [
            internal('Getting Started', 'docs'),
            internal('Codestar Framework', 'docs/codestar-framework'),
            internal('Theme Extensions', 'docs/api'),
            internal('WordPress AI', 'docs/wp-ai'),
          ],
        },
        tools: {
          title: 'Tools',
          links: [
            internal('MCP', 'docs/mcp'),
            internal('Codex plugins', 'docs/ai/codex-plugin'),
            internal('LLM text', 'docs/llms'),
            external('GitHub repository', projectConfig.repositoryUrl),
          ],
        },
        community: {
          title: 'Community',
          links: [
            internal('Friends', 'friends'),
            external('Issues', projectConfig.issuesUrl),
            external('Discussions', projectConfig.discussionsUrl),
            external('QQ group', 'https://qm.qq.com/q/IEPNaHVks0'),
          ],
        },
      },
      note: 'Documentation is maintained and reviewed by the community.',
      copyright: 'Community-maintained Zibll theme documentation',
      github: 'GitHub repository',
      discussions: 'GitHub Discussions',
      qq: 'QQ group',
    };
  }

  if (locale === 'ja') {
    return {
      sections: {
        about: {
          title: 'このサイトについて',
          links: [
            internal('プロジェクト概要', 'docs'),
            internal('コミュニティガイド', 'docs/community'),
            external('お知らせ', projectConfig.announcementUrl),
          ],
        },
        docs: {
          title: 'ドキュメント',
          links: [
            internal('使用ガイド', 'docs'),
            internal('Codestar Framework', 'docs/codestar-framework'),
            internal('テーマ拡張', 'docs/api'),
            internal('WordPress AI', 'docs/wp-ai'),
          ],
        },
        tools: {
          title: '開発ツール',
          links: [
            internal('MCP', 'docs/mcp'),
            internal('Codex プラグイン', 'docs/ai/codex-plugin'),
            internal('LLM テキスト', 'docs/llms'),
            external('GitHub リポジトリ', projectConfig.repositoryUrl),
          ],
        },
        community: {
          title: 'コミュニティ',
          links: [
            internal('リンク', 'friends'),
            external('Issues', projectConfig.issuesUrl),
            external('Discussions', projectConfig.discussionsUrl),
            external('QQ グループ', 'https://qm.qq.com/q/IEPNaHVks0'),
          ],
        },
      },
      note: 'ドキュメントはコミュニティが継続的に整理・確認しています。',
      copyright: 'コミュニティ運営の子比テーマ開発ドキュメント',
      github: 'GitHub リポジトリ',
      discussions: 'GitHub Discussions',
      qq: 'QQ グループ',
    };
  }

  return {
    sections: {
      about: {
        title: '关于本站',
        links: [
          internal('项目说明', 'docs'),
          internal('社区协作', 'docs/community'),
          external('项目公告', projectConfig.announcementUrl),
        ],
      },
      docs: {
        title: '文档',
        links: [
          internal('使用指南', 'docs'),
          internal('Codestar Framework', 'docs/codestar-framework'),
          internal('主题扩展', 'docs/api'),
          internal('WordPress AI', 'docs/wp-ai'),
        ],
      },
      tools: {
        title: '开发工具',
        links: [
          internal('MCP 服务器', 'docs/mcp'),
          internal('Codex 插件', 'docs/ai/codex-plugin'),
          internal('LLM 文本', 'docs/llms'),
          external('GitHub 仓库', projectConfig.repositoryUrl),
        ],
      },
      community: {
        title: '社区与友情链接',
        links: [
          internal('友情链接', 'friends'),
          external('Issues', projectConfig.issuesUrl),
          external('Discussions', projectConfig.discussionsUrl),
          external('加入 QQ 群', 'https://qm.qq.com/q/IEPNaHVks0'),
        ],
      },
    },
    note: '内容由社区持续整理和校对。',
    copyright: '社区共同维护的子比主题开发文档',
    github: 'GitHub 仓库',
    discussions: 'GitHub Discussions',
    qq: '加入 QQ 群',
  };
}

function FooterSection({
  section,
  locale,
}: {
  section: { title: string; links: FooterLink[] };
  locale: Locale;
}) {
  return (
    <div>
      <h2 className="text-fd-foreground mb-4 text-sm font-semibold">
        {section.title}
      </h2>
      <ul className="space-y-3">
        {section.links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-fd-muted-foreground hover:text-fd-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                {link.label}
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ) : (
              <Link
                href={localized(link.href, locale)}
                className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ locale = 'zh' }: { locale?: Locale }) {
  const copy = buildCopy(locale);
  const sections = Object.values(copy.sections);

  return (
    <footer className="border-fd-border bg-fd-card/30 mt-auto border-t backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-10 md:grid-cols-4 lg:gap-x-12">
          {sections.map((section) => (
            <FooterSection
              key={section.title}
              section={section}
              locale={locale}
            />
          ))}
        </div>

        <div className="border-fd-border flex flex-col items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center">
          <div className="text-fd-muted-foreground flex flex-col gap-2 text-xs">
            <p>{copy.copyright}</p>
            <p>{copy.note}</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={projectConfig.repositoryUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              aria-label={copy.github}
            >
              <Github className="size-4" />
            </a>
            <a
              href={projectConfig.discussionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              aria-label={copy.discussions}
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href="https://qm.qq.com/q/IEPNaHVks0"
              target="_blank"
              rel="noreferrer noopener"
              className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              aria-label={copy.qq}
            >
              <Handshake className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
