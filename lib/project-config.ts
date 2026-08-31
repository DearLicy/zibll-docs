const githubOwner = 'DearLicy';
const githubRepo = 'zibll-docs';
const repositoryUrl = `https://github.com/${githubOwner}/${githubRepo}`;
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const defaultSiteUrl = 'https://dearlicy.github.io/zibll-docs';
const publicSiteUrl = (configuredSiteUrl || defaultSiteUrl).replace(/\/+$/, '');

export const projectConfig = {
  siteName: '子比主题开发文档',
  githubOwner,
  githubRepo,
  githubBranch: 'main',
  repositoryUrl,
  issuesUrl: `${repositoryUrl}/issues`,
  discussionsUrl: `${repositoryUrl}/discussions`,
  contributorsUrl: `${repositoryUrl}/graphs/contributors`,
  announcementUrl: 'https://www.zibll.top/forum-post/51202.html',
  siteUrl: publicSiteUrl,
  description:
    '由社区共同维护的子比主题二次开发文档，覆盖插件、子主题、Codestar Framework、MCP 与 Codex 插件。',
  mcpPackage: 'zibll-docs-mcp',
} as const;

export function siteUrl(path = '/') {
  const normalizedPath = path.replace(/^\/+/, '');
  return normalizedPath
    ? `${projectConfig.siteUrl}/${normalizedPath}`
    : `${projectConfig.siteUrl}/`;
}

export function githubFileUrl(path: string) {
  return `${repositoryUrl}/blob/${projectConfig.githubBranch}/${path}`;
}

export function githubEditUrl(path: string) {
  return `${repositoryUrl}/edit/${projectConfig.githubBranch}/${path}`;
}

export function githubNewIssueUrl({
  title,
  body,
  labels = [],
}: {
  title: string;
  body: string;
  labels?: string[];
}) {
  const query = new URLSearchParams({ title, body });
  if (labels.length) query.set('labels', labels.join(','));
  return `${repositoryUrl}/issues/new?${query.toString()}`;
}
