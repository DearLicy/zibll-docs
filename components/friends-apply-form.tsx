'use client';

import { FormEvent, useState } from 'react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { friendsCopy } from '@/lib/friends-copy';
import { i18n, type Locale } from '@/lib/i18n';
import { projectConfig, githubNewIssueUrl } from '@/lib/project-config';

type FriendForm = {
  name: string;
  url: string;
  description: string;
  logo: string;
  email: string;
  backlink: string;
};

const initialForm: FriendForm = {
  name: '',
  url: '',
  description: '',
  logo: '',
  email: '',
  backlink: '',
};

const fieldLimits = {
  name: 80,
  url: 2048,
  description: 300,
  logo: 2048,
  email: 254,
  backlink: 2048,
} as const;

function singleLine(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function validateUrl(
  value: string,
  label: string,
  invalidMessage: (label: string) => string,
) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return '';
  } catch {
    return invalidMessage(label);
  }
}

export function FriendsApplyForm({
  locale = i18n.defaultLanguage,
}: {
  locale?: Locale;
}) {
  const t = friendsCopy[locale].form;
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);

  function update(key: keyof FriendForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = {
      name: singleLine(form.name),
      url: singleLine(form.url),
      description: singleLine(form.description),
      logo: singleLine(form.logo),
      email: singleLine(form.email),
      backlink: singleLine(form.backlink),
    };
    const nameError = !values.name
      ? t.required
      : values.name.length > fieldLimits.name
        ? t.tooLong(t.name, fieldLimits.name)
        : '';
    const descriptionError = !values.description
      ? t.required
      : values.description.length > fieldLimits.description
        ? t.tooLong(t.description, fieldLimits.description)
        : '';
    const urlError =
      values.url.length > fieldLimits.url
        ? t.tooLong(t.url, fieldLimits.url)
        : validateUrl(values.url, t.url, t.invalidUrl);
    const logoError = values.logo
      ? values.logo.length > fieldLimits.logo
        ? t.tooLong(t.logo, fieldLimits.logo)
        : validateUrl(values.logo, t.logo, t.invalidUrl)
      : '';
    const emailError = values.email
      ? values.email.length > fieldLimits.email
        ? t.tooLong(t.email, fieldLimits.email)
        : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)
          ? ''
          : t.invalidEmail
      : '';
    const backlinkError = values.backlink
      ? values.backlink.length > fieldLimits.backlink
        ? t.tooLong(t.backlink, fieldLimits.backlink)
        : validateUrl(values.backlink, t.backlink, t.invalidUrl)
      : '';
    if (
      nameError ||
      descriptionError ||
      urlError ||
      logoError ||
      emailError ||
      backlinkError
    ) {
      setError(
        nameError ||
          descriptionError ||
          urlError ||
          logoError ||
          emailError ||
          backlinkError,
      );
      return;
    }

    setOpening(true);
    const body = [
      '## 友情链接申请',
      '',
      `- 名称：${values.name}`,
      `- 网站地址：${values.url}`,
      `- 网站介绍：${values.description}`,
      `- Logo：${values.logo || '未提供'}`,
      `- 联系邮箱：${values.email || '未提供'}`,
      `- 回链地址：${values.backlink || '未提供'}`,
      '',
      '### 审核说明',
      '我已确认网站可以正常访问，提交内容真实有效，并同意维护者公开展示上述信息。',
    ].join('\n');
    const issueUrl = githubNewIssueUrl({
      title: `友情链接申请：${values.name}`,
      body,
      labels: ['friend-link'],
    });
    window.location.assign(issueUrl);
  }

  return (
    <form
      onSubmit={submit}
      className="border-fd-border bg-fd-card/40 grid gap-4 rounded-lg border p-5"
    >
      <Field
        label={t.name}
        required
        value={form.name}
        onChange={(value) => update('name', value)}
        placeholder={t.namePlaceholder}
        maxLength={fieldLimits.name}
      />
      <Field
        label={t.url}
        required
        type="url"
        value={form.url}
        onChange={(value) => update('url', value)}
        placeholder={t.urlPlaceholder}
        maxLength={fieldLimits.url}
      />
      <Field
        label={t.description}
        required
        multiline
        value={form.description}
        onChange={(value) => update('description', value)}
        placeholder={t.descriptionPlaceholder}
        maxLength={fieldLimits.description}
      />
      <Field
        label={t.logo}
        type="url"
        value={form.logo}
        onChange={(value) => update('logo', value)}
        placeholder={t.logoPlaceholder}
        maxLength={fieldLimits.logo}
      />
      <Field
        label={t.email}
        type="email"
        value={form.email}
        onChange={(value) => update('email', value)}
        placeholder={t.emailPlaceholder}
        maxLength={fieldLimits.email}
      />
      <Field
        label={t.backlink}
        type="url"
        value={form.backlink}
        onChange={(value) => update('backlink', value)}
        placeholder={t.backlinkPlaceholder}
        maxLength={fieldLimits.backlink}
      />
      {error ? (
        <p role="alert" className="text-destructive text-sm leading-6">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={opening}
        className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70"
      >
        {opening ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowUpRight className="size-4" />
        )}
        {opening ? t.opening : t.submit}
      </button>
      <p className="text-fd-muted-foreground text-xs leading-5">
        {t.footer} ({projectConfig.githubOwner}/{projectConfig.githubRepo})
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
}) {
  const className =
    'bg-fd-background border-fd-border focus:border-fd-primary/50 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors';
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-destructive ms-1">*</span> : null}
      </span>
      {multiline ? (
        <textarea
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={maxLength}
          className={`${className} resize-y`}
        />
      ) : (
        <input
          required={required}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      )}
    </label>
  );
}
