import { homeOptions } from '@/lib/layout.shared';
import { friendsCopy } from '@/lib/friends-copy';
import { i18n, type Locale } from '@/lib/i18n';
import { SiteFooter } from '@/components/site-footer';
import { projectConfig } from '@/lib/project-config';
import { withBasePath } from '@/lib/site-path';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ExternalLink, Handshake, Plus, ShieldCheck } from 'lucide-react';
import { FriendsApplyForm } from '@/components/friends-apply-form';
import friends from '@/data/friends.json';

export function FriendsPage({
  locale = i18n.defaultLanguage,
}: {
  locale?: Locale;
}) {
  const t = friendsCopy[locale];

  return (
    <HomeLayout {...homeOptions(locale)}>
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="max-w-3xl">
          <div className="text-fd-muted-foreground mb-4 flex items-center gap-2 text-sm">
            <Handshake className="size-4" />
            {t.eyebrow}
          </div>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-fd-muted-foreground mt-4 text-base leading-8">
            {t.description}
          </p>
        </header>

        <section className="mt-12" aria-labelledby="friends-list-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="friends-list-heading" className="text-xl font-semibold">
                {t.listed}
              </h2>
              <p className="text-fd-muted-foreground mt-1 text-sm">
                {t.listedDescription}
              </p>
            </div>
            <a
              href={projectConfig.issuesUrl}
              target="_blank"
              rel="noreferrer"
              className="text-fd-muted-foreground hover:text-fd-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              {t.review}
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <a
                key={friend.url}
                href={friend.url}
                target="_blank"
                rel="noreferrer"
                className="border-fd-border hover:border-fd-foreground/25 hover:bg-fd-accent/35 group flex min-h-44 flex-col rounded-lg border p-5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {friend.logo ? (
                    <img
                      src={withBasePath(friend.logo)}
                      alt={`${friend.name} logo`}
                      width={48}
                      height={48}
                      className="bg-fd-muted/50 size-12 rounded-lg border object-contain p-1.5"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="bg-fd-muted text-fd-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg border text-lg font-semibold"
                    >
                      {Array.from(friend.name.trim())[0] || '?'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{friend.name}</h3>
                    <p className="text-fd-muted-foreground mt-1 truncate text-xs">
                      {friend.url.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                  <ExternalLink className="text-fd-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-fd-muted-foreground mt-5 text-sm leading-6">
                  {friend.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="border-fd-border mt-14 grid gap-8 border-t pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Plus className="size-5" />
              <h2 className="text-xl font-semibold">{t.applyTitle}</h2>
            </div>
            <p className="text-fd-muted-foreground mt-3 text-sm leading-7">
              {t.applyDescription}
            </p>
            <div className="text-fd-muted-foreground mt-6 flex items-start gap-2 text-sm leading-6">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <span>{t.policy}</span>
            </div>
          </div>
          <FriendsApplyForm locale={locale} />
        </section>
      </main>
      <SiteFooter locale={locale} />
    </HomeLayout>
  );
}
