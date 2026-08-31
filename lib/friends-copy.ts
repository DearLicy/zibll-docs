import type { Locale } from '@/lib/i18n';

export type FriendsCopy = {
  eyebrow: string;
  title: string;
  description: string;
  listed: string;
  listedDescription: string;
  review: string;
  applyTitle: string;
  applyDescription: string;
  policy: string;
  form: {
    name: string;
    namePlaceholder: string;
    url: string;
    urlPlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    logo: string;
    logoPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    backlink: string;
    backlinkPlaceholder: string;
    submit: string;
    opening: string;
    footer: string;
    required: string;
    invalidEmail: string;
    tooLong: (label: string, max: number) => string;
    invalidUrl: (label: string) => string;
  };
};

export const friendsCopy: Record<Locale, FriendsCopy> = {
  zh: {
    eyebrow: '社区连接',
    title: '友情链接',
    description:
      '这里收录与子比主题、WordPress 开发和独立站建设相关的项目。申请收录不需要本站账号，提交的信息会通过 GitHub Issue 进入公开审核流程。',
    listed: '已收录',
    listedDescription: '默认友情链接为子比主题官方网站。',
    review: '查看审核记录',
    applyTitle: '申请友情链接',
    applyDescription:
      '填写完整信息后，页面会打开一个预填的 GitHub Issue。维护者审核通过后，将把链接加入 `data/friends.json` 并发布新版本。',
    policy:
      '请提交真实、可访问且与 WordPress、主题、插件或开发者社区相关的网站；不收录违法、恶意跳转和自动下载页面。',
    form: {
      name: '名称',
      namePlaceholder: '网站或项目名称',
      url: '网址',
      urlPlaceholder: 'https://example.com',
      description: '介绍',
      descriptionPlaceholder: '用一句话介绍网站或项目',
      logo: 'Logo 地址',
      logoPlaceholder: 'https://example.com/logo.png（可选）',
      email: '联系邮箱',
      emailPlaceholder: '用于审核沟通（可选）',
      backlink: '回链地址',
      backlinkPlaceholder: '放置本站链接的页面（可选）',
      submit: '打开 GitHub 申请',
      opening: '正在打开 GitHub',
      footer:
        '提交后会跳转到公开 Issue 页面；邮箱和回链也会公开，请只填写可公开的信息。',
      required: '请填写名称和介绍。',
      invalidEmail: '联系邮箱格式不正确。',
      tooLong: (label, max) => `${label}不能超过 ${max} 个字符。`,
      invalidUrl: (label) => `${label}需要是完整的 http:// 或 https:// 地址。`,
    },
  },
  en: {
    eyebrow: 'Community links',
    title: 'Friends',
    description:
      'A curated list of projects related to Zibll, WordPress development, and independent websites. No account is required; applications are reviewed through public GitHub Issues.',
    listed: 'Listed sites',
    listedDescription: 'The default listing is the official Zibll website.',
    review: 'View review history',
    applyTitle: 'Request a listing',
    applyDescription:
      'Complete the form and a pre-filled GitHub Issue will open. After review, approved links are added to `data/friends.json` and published with the next build.',
    policy:
      'Submit a real, reachable site related to WordPress, themes, plugins, or developer communities. We do not list illegal content, malicious redirects, or automatic downloads.',
    form: {
      name: 'Name',
      namePlaceholder: 'Website or project name',
      url: 'Website URL',
      urlPlaceholder: 'https://example.com',
      description: 'Description',
      descriptionPlaceholder: 'Describe the site or project in one sentence',
      logo: 'Logo URL',
      logoPlaceholder: 'https://example.com/logo.png (optional)',
      email: 'Contact email',
      emailPlaceholder: 'For review communication (optional)',
      backlink: 'Backlink URL',
      backlinkPlaceholder: 'Page containing a link to this site (optional)',
      submit: 'Open GitHub request',
      opening: 'Opening GitHub',
      footer:
        'You will be redirected to a public GitHub Issue. Email and backlink fields are public too.',
      required: 'Please provide a name and description.',
      invalidEmail: 'Enter a valid contact email address.',
      tooLong: (label, max) => `${label} must not exceed ${max} characters.`,
      invalidUrl: (label) =>
        `${label} must be a complete http:// or https:// URL.`,
    },
  },
  ja: {
    eyebrow: 'コミュニティリンク',
    title: 'リンク',
    description:
      '子比テーマ、WordPress 開発、個人サイトに関係するプロジェクトを紹介します。申請にこのサイトのアカウントは不要で、GitHub Issue を通じて公開審査します。',
    listed: '掲載中',
    listedDescription: '初期掲載は子比テーマ公式サイトです。',
    review: '審査記録を見る',
    applyTitle: 'リンク掲載を申請',
    applyDescription:
      '情報を入力すると、内容を埋め込んだ GitHub Issue が開きます。審査後、承認されたリンクは `data/friends.json` に追加され、次のビルドで公開されます。',
    policy:
      'WordPress、テーマ、プラグイン、開発者コミュニティに関係する、実際にアクセスできるサイトを送信してください。違法な内容、悪意のあるリダイレクト、自動ダウンロードは掲載しません。',
    form: {
      name: '名称',
      namePlaceholder: 'サイトまたはプロジェクト名',
      url: 'URL',
      urlPlaceholder: 'https://example.com',
      description: '紹介',
      descriptionPlaceholder: 'サイトまたはプロジェクトを一文で紹介',
      logo: 'Logo URL',
      logoPlaceholder: 'https://example.com/logo.png（任意）',
      email: '連絡先メール',
      emailPlaceholder: '審査連絡用（任意）',
      backlink: '相互リンク URL',
      backlinkPlaceholder: 'このサイトへのリンクを置くページ（任意）',
      submit: 'GitHub で申請',
      opening: 'GitHub を開いています',
      footer:
        '公開 GitHub Issue に移動します。メールと相互リンク URL も公開されます。',
      required: '名称と紹介を入力してください。',
      invalidEmail: '有効な連絡先メールを入力してください。',
      tooLong: (label, max) => `${label}は ${max} 文字以内で入力してください。`,
      invalidUrl: (label) =>
        `${label}には完全な http:// または https:// URL が必要です。`,
    },
  },
};
