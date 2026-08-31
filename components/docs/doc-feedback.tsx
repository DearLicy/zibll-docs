'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { feedbackEndpoint } from '@/lib/feedback-config';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
} from 'fumadocs-ui/components/ui/collapsible';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

const copy = {
  zh: {
    question: '这篇文档对您有帮助吗？',
    good: '有帮助',
    bad: '没帮助',
    placeholder: '请留下您的反馈，帮助我们继续完善文档。',
    submit: '提交反馈',
    pending: '正在提交',
    thanks: '感谢您的反馈！',
    viewOnGithub: '在 GitHub 查看',
    again: '重新提交',
    note: '反馈会由 GitHub Bot 创建为公开 Issue。',
    unavailable: 'GitHub Bot 尚未配置，请稍后再试。',
    failed: '提交失败，请稍后重试。',
  },
  en: {
    question: 'Was this document helpful?',
    good: 'Helpful',
    bad: 'Not helpful',
    placeholder: 'Tell us how we can improve this document.',
    submit: 'Submit feedback',
    pending: 'Submitting',
    thanks: 'Thanks for your feedback!',
    viewOnGithub: 'View on GitHub',
    again: 'Submit again',
    note: 'A GitHub Bot will create a public Issue from your feedback.',
    unavailable:
      'The GitHub Bot is not configured yet. Please try again later.',
    failed: 'Submission failed. Please try again later.',
  },
  ja: {
    question: 'このドキュメントは役に立ちましたか？',
    good: '役に立った',
    bad: '役に立たない',
    placeholder: '改善のためのフィードバックを入力してください。',
    submit: 'フィードバックを送信',
    pending: '送信中',
    thanks: 'フィードバックありがとうございます！',
    viewOnGithub: 'GitHubで見る',
    again: 'もう一度送信',
    note: 'フィードバックは GitHub Bot が公開 Issue として作成します。',
    unavailable:
      'GitHub Bot がまだ設定されていません。後でもう一度お試しください。',
    failed: '送信に失敗しました。後でもう一度お試しください。',
  },
} as const;

type Opinion = 'good' | 'bad';

type SubmittedFeedback = {
  opinion: Opinion;
  githubUrl: string;
};

function readStoredFeedback(value: string | null): SubmittedFeedback | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<SubmittedFeedback>;
    if (
      (parsed.opinion === 'good' || parsed.opinion === 'bad') &&
      typeof parsed.githubUrl === 'string' &&
      parsed.githubUrl.startsWith('https://github.com/')
    ) {
      return {
        opinion: parsed.opinion,
        githubUrl: parsed.githubUrl,
      };
    }
  } catch {
    // Ignore the legacy opinion-only value from the previous implementation.
  }

  return null;
}

export function DocFeedback({
  title,
  locale = 'zh',
}: {
  title: string;
  locale?: keyof typeof copy;
}) {
  const pathname = usePathname() || '/docs';
  const t = copy[locale];
  const storageKey = `zibll-docs-feedback:${pathname}`;
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedFeedback | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSubmitted(readStoredFeedback(window.localStorage.getItem(storageKey)));
  }, [storageKey]);

  function choose(next: Opinion) {
    if (submitted || isPending) return;
    setError('');
    setOpinion(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!opinion || isPending) return;

    if (!feedbackEndpoint) {
      setError(t.unavailable);
      return;
    }

    setError('');
    setIsPending(true);

    try {
      const response = await fetch(feedbackEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          opinion,
          message: message.trim(),
          page: window.location.href,
          title,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        githubUrl?: unknown;
      } | null;
      if (
        !response.ok ||
        typeof result?.githubUrl !== 'string' ||
        !result.githubUrl.startsWith('https://github.com/')
      ) {
        throw new Error('Feedback bot request failed');
      }

      const next: SubmittedFeedback = {
        opinion,
        githubUrl: result.githubUrl,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setSubmitted(next);
      setOpinion(null);
      setMessage('');
    } catch {
      setError(t.failed);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Collapsible
      id="doc-feedback"
      open={opinion !== null || submitted !== null || error !== ''}
      onOpenChange={(open) => {
        if (!open && !submitted) {
          setOpinion(null);
          setError('');
        }
      }}
      className="border-fd-border mt-10 border-y py-3"
    >
      <div className="flex flex-row flex-wrap items-center gap-2">
        <p className="pe-2 text-sm font-medium">{t.question}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={submitted !== null || isPending}
          className={cn(
            'text-fd-muted-foreground rounded-full',
            (submitted?.opinion === 'good' || opinion === 'good') &&
              'bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current',
          )}
          onClick={() => choose('good')}
        >
          <ThumbsUp className="size-4" />
          {t.good}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={submitted !== null || isPending}
          className={cn(
            'text-fd-muted-foreground rounded-full',
            (submitted?.opinion === 'bad' || opinion === 'bad') &&
              'bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current',
          )}
          onClick={() => choose('bad')}
        >
          <ThumbsDown className="size-4" />
          {t.bad}
        </Button>
      </div>
      <CollapsibleContent className="mt-3">
        {submitted ? (
          <div className="bg-fd-card text-fd-muted-foreground flex flex-col items-center gap-3 rounded-xl border px-3 py-6 text-center text-sm">
            <p>{t.thanks}</p>
            <div className="flex flex-row items-center gap-2">
              <a
                href={submitted.githubUrl}
                rel="noreferrer noopener"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'text-xs',
                )}
              >
                {t.viewOnGithub}
                <ExternalLink className="size-3.5" />
              </a>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => {
                  window.localStorage.removeItem(storageKey);
                  setSubmitted(null);
                  setOpinion(submitted.opinion);
                }}
              >
                {t.again}
              </Button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <textarea
              autoFocus
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t.placeholder}
              rows={3}
              className="bg-fd-secondary text-fd-secondary-foreground placeholder:text-fd-muted-foreground focus-visible:ring-fd-ring resize-none rounded-lg border p-3 text-sm outline-none focus-visible:ring-2"
              onKeyDown={(event) => {
                if (!event.shiftKey && event.key === 'Enter') {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            {error ? (
              <p
                role="alert"
                className="text-destructive flex items-center gap-1.5 text-sm"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-fd-muted-foreground text-xs">{t.note}</p>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                {isPending ? t.pending : t.submit}
              </Button>
            </div>
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
