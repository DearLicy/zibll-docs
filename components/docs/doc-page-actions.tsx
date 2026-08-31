'use client';

import { cn } from '@/lib/utils';
import { githubEditUrl } from '@/lib/project-config';
import { withBasePath } from '@/lib/site-path';
import {
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  ExternalLink,
  FileText,
  Github,
  MessageCircle,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';

const copy = {
  zh: {
    copied: '已复制',
    copy: '复制 Markdown',
    failed: '复制失败',
    open: '打开',
    github: '在 GitHub 中打开',
    edit: '在 GitHub 编辑',
    markdown: '查看 Markdown',
    feedback: '提交反馈',
    chatgpt: '在 ChatGPT 中打开',
    claude: '在 Claude 中打开',
    cursor: '在 Cursor 中打开',
    prompt: '请阅读 {url}，我想围绕这个页面提问。',
  },
  en: {
    copied: 'Copied',
    copy: 'Copy Markdown',
    failed: 'Copy failed',
    open: 'Open',
    github: 'Open in GitHub',
    edit: 'Edit on GitHub',
    markdown: 'View Markdown',
    feedback: 'Send feedback',
    chatgpt: 'Open in ChatGPT',
    claude: 'Open in Claude',
    cursor: 'Open in Cursor',
    prompt: 'Read {url}, I want to ask questions about it.',
  },
  ja: {
    copied: 'コピーしました',
    copy: 'Markdownをコピー',
    failed: 'コピーに失敗しました',
    open: '開く',
    github: 'GitHubで開く',
    edit: 'GitHubで編集',
    markdown: 'Markdownを表示',
    feedback: 'フィードバックを送る',
    chatgpt: 'ChatGPTで開く',
    claude: 'Claudeで開く',
    cursor: 'Cursorで開く',
    prompt: '{url}を読んで、このページについて質問します。',
  },
} as const;

type Locale = keyof typeof copy;

function actionClassName() {
  return 'inline-flex h-8 items-center gap-2 rounded-md border border-fd-border px-3 text-xs font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';
}

function optionClassName() {
  return 'inline-flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4';
}

export function DocPageActions({
  markdownUrl,
  sourcePath,
  pageUrl,
  locale = 'zh',
}: {
  markdownUrl: string;
  sourcePath: string;
  pageUrl: string;
  locale?: Locale;
}) {
  const t = copy[locale];
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const staticMarkdownUrl = withBasePath(markdownUrl);

  async function copyMarkdown() {
    try {
      const response = await fetch(staticMarkdownUrl);
      if (!response.ok)
        throw new Error(`Markdown request failed: ${response.status}`);
      const value = await response.text();
      await navigator.clipboard.writeText(value);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 1600);
    } catch {
      setStatus('failed');
      window.setTimeout(() => setStatus('idle'), 2200);
    }
  }

  const items = useMemo(() => {
    const url = typeof window === 'undefined' ? pageUrl : window.location.href;
    const prompt = t.prompt.replace('{url}', url);
    return [
      {
        title: t.github,
        href: githubEditUrl(sourcePath),
        icon: <Github />,
        internal: false,
      },
      {
        title: t.markdown,
        href: staticMarkdownUrl,
        icon: <FileText />,
        internal: false,
      },
      {
        title: t.feedback,
        href: '#doc-feedback',
        icon: <CircleHelp />,
        internal: true,
      },
      {
        title: t.chatgpt,
        href: `https://chatgpt.com/?${new URLSearchParams({ prompt, hints: 'search' })}`,
        icon: <Sparkles />,
        internal: false,
      },
      {
        title: t.claude,
        href: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
        icon: <MessageCircle />,
        internal: false,
      },
      {
        title: t.cursor,
        href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: prompt })}`,
        icon: <Pencil />,
        internal: false,
      },
    ];
  }, [pageUrl, sourcePath, staticMarkdownUrl, t]);

  return (
    <div className="not-prose border-fd-border mb-6 flex flex-wrap items-center gap-2 border-b pb-6">
      <button
        type="button"
        onClick={() => void copyMarkdown()}
        className={actionClassName()}
      >
        {status === 'copied' ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {status === 'copied'
          ? t.copied
          : status === 'failed'
            ? t.failed
            : t.copy}
      </button>
      <Popover>
        <PopoverTrigger
          className={cn(actionClassName(), 'data-[state=open]:bg-fd-accent')}
        >
          {t.open}
          <ChevronDown className="text-fd-muted-foreground size-3.5" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-0.5 p-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.internal ? undefined : '_blank'}
              rel={item.internal ? undefined : 'noreferrer noopener'}
              className={optionClassName()}
            >
              {item.icon}
              {item.title}
              <ExternalLink className="text-fd-muted-foreground ms-auto size-3.5" />
            </a>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
