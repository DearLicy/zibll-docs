export const routes = {
  home: '/',
  friends: '/friends',
  docs: {
    root: '/docs',
    sourceStructure: '/docs/source-structure',
    faq: '/docs/faq',
    codestarFramework: '/docs/codestar-framework',
    api: '/docs/api',
    wpAi: '/docs/wp-ai',
    ai: '/docs/ai',
    skills: '/docs/skills',
    llms: '/docs/llms',
    mcp: '/docs/mcp',
    community: '/docs/community',
    sponsor: '/docs/sponsor',
  },
  staticResources: {
    llms: '/llms.txt',
    llmsFull: '/llms-full.txt',
    search: '/api/search',
    mcpManifest: '/mcp/manifest.json',
    mcpResources: '/mcp/resources.json',
  },
} as const;

export type DocsNavigationItem = {
  id:
    | 'guide'
    | 'codestar-framework'
    | 'api'
    | 'wp-ai'
    | 'ai'
    | 'community'
    | 'sponsor';
  title: string;
  url: string;
  contentDirectory: string;
  metaFile: string;
};

export const docsNavigationManifest: readonly DocsNavigationItem[] = [
  {
    id: 'guide',
    title: '使用指南',
    url: routes.docs.root,
    contentDirectory: 'content/docs/guide',
    metaFile: 'content/docs/guide/meta.json',
  },
  {
    id: 'codestar-framework',
    title: 'Codestar Framework',
    url: routes.docs.codestarFramework,
    contentDirectory: 'content/docs/codestar-framework',
    metaFile: 'content/docs/codestar-framework/meta.json',
  },
  {
    id: 'api',
    title: '主题扩展',
    url: routes.docs.api,
    contentDirectory: 'content/docs/api',
    metaFile: 'content/docs/api/meta.json',
  },
  {
    id: 'wp-ai',
    title: 'WP AI',
    url: routes.docs.wpAi,
    contentDirectory: 'content/docs/wp-ai',
    metaFile: 'content/docs/wp-ai/meta.json',
  },
  {
    id: 'ai',
    title: '开发工具',
    url: routes.docs.ai,
    contentDirectory: 'content/docs/ai',
    metaFile: 'content/docs/ai/meta.json',
  },
  {
    id: 'community',
    title: '社区协作',
    url: routes.docs.community,
    contentDirectory: 'content/docs/community',
    metaFile: 'content/docs/community/meta.json',
  },
  {
    id: 'sponsor',
    title: '赞助打赏',
    url: routes.docs.sponsor,
    contentDirectory: 'content/docs/sponsor',
    metaFile: 'content/docs/sponsor/meta.json',
  },
];

export const docsTopNavigationItems = docsNavigationManifest;

export const publicPageRoutes = [
  { id: 'home', title: '文档首页', path: routes.home },
  { id: 'friends', title: '友情链接', path: routes.friends },
  ...docsTopNavigationItems.map((item) => ({
    id: item.id,
    title: item.title,
    path: item.url,
  })),
] as const;
