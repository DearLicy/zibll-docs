import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { docsNavigationManifest } from '@/lib/routes';
import { projectConfig, siteUrl } from '@/lib/project-config';

type DocsMeta = {
  root?: boolean;
  pages?: string[];
};

type StaticDoc = {
  slug: string;
  title: string;
  description: string;
  url: string;
  sourcePath: string;
  markdown: string;
};

const rootDir = resolve('.');
const publicDir = resolve('public');

function fail(message: string): never {
  throw new Error(`[zibll-docs] ${message}`);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

function directoryHasFiles(path: string): boolean {
  if (!existsSync(path)) return false;

  return readdirSync(path, { withFileTypes: true }).some((entry) => {
    const entryPath = resolve(path, entry.name);
    return entry.isDirectory() ? directoryHasFiles(entryPath) : true;
  });
}

function assertRemovedPaths() {
  const removedDirectories = [
    'app/admin',
    'app/api/admin',
    'app/api/auth',
    'app/api/ai',
    'app/api/deploy',
    'app/api/plugins',
    'app/api/uploads',
    'app/share',
    'app/mcp',
    'app/codex-plugin',
    'app/llms.mdx',
    'components/admin',
    'components/account',
    'components/auth',
    'components/ai',
    'components/zola',
    'components/prompt-kit',
    'content/docs/installation',
    'content/docs/apps',
    'content/docs/business',
    'content/docs/legal',
    'content/docs/plugins',
    'plugins/zibll-deploy-helper',
    'lib/auth',
    'lib/zola',
    'prisma',
  ];

  for (const directory of removedDirectories) {
    if (directoryHasFiles(resolve(directory))) {
      fail(`removed runtime feature exists again: ${directory}`);
    }
  }

  const removedFiles = [
    'app/api/feedback/route.ts',
    'app/api/ai/settings/route.ts',
    'app/api/site/route.ts',
    'app/api/sponsor/route.ts',
    'components/deploy-queue-console.tsx',
    'components/deploy-log-viewer.tsx',
    'components/docs/ask-ai-floating.tsx',
    'components/docs/ai-docs-chat.tsx',
    'lib/ai-docs.ts',
    'lib/ai-types.ts',
    'lib/deploy-queue.ts',
    'lib/mcp-docs-server.ts',
    'lib/redis.ts',
    'lib/source-code-tools.ts',
    'proxy.ts',
  ];

  for (const file of removedFiles) {
    if (existsSync(resolve(file)))
      fail(`removed runtime file exists again: ${file}`);
  }

  const apiFiles = collectFiles(resolve('app/api')).map((file) =>
    file.slice(rootDir.length + 1).replaceAll('\\', '/'),
  );
  const allowedApiFiles = ['app/api/search/route.ts'];
  if (
    apiFiles.some((file) => !allowedApiFiles.includes(file)) ||
    apiFiles.length !== allowedApiFiles.length
  ) {
    fail(
      `only the build-time Fumadocs search route may remain: ${apiFiles.join(', ')}`,
    );
  }
}

function collectFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

function assertNoRuntimeEnvReads() {
  const forbidden = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'AI_API_KEY',
    'OPENAI_API_KEY',
    'REDIS_URL',
    'NEXT_PUBLIC_GITHUB_OWNER',
    'NEXT_PUBLIC_GITHUB_REPO',
  ];

  for (const directory of ['app', 'components', 'lib', 'scripts']) {
    for (const path of collectFiles(resolve(directory))) {
      if (!/\.(?:ts|tsx|js|mjs)$/.test(path)) continue;
      const content = readFileSync(path, 'utf8');
      for (const name of forbidden) {
        if (content.includes(`process.env.${name}`)) {
          fail(
            `static site reads runtime environment variable ${name}: ${path}`,
          );
        }
      }
    }
  }
}

function assertStaticDocsRoute() {
  const docsPage = readFileSync(
    resolve('app/docs/[[...slug]]/page.tsx'),
    'utf8',
  );
  for (const required of ['generateStaticParams', 'dynamicParams = false']) {
    if (!docsPage.includes(required))
      fail(`docs route is not static: ${required}`);
  }

  const searchRoute = readFileSync(resolve('app/api/search/route.ts'), 'utf8');
  for (const required of ["dynamic = 'force-static'", 'search.staticGET']) {
    if (!searchRoute.includes(required)) {
      fail(`Fumadocs search route is not build-time static: ${required}`);
    }
  }

  const localizedPage = readFileSync(
    resolve('app/[lang]/docs/[[...slug]]/page.tsx'),
    'utf8',
  );
  for (const required of ['generateStaticParams', 'dynamicParams = false']) {
    if (!localizedPage.includes(required)) {
      fail(`localized docs route is not static: ${required}`);
    }
  }
}

function assertNavigationManifest() {
  const rootMeta = readJson<DocsMeta>('content/docs/meta.json');
  const configuredRoots = docsNavigationManifest.map((item) => item.id);
  const listedRoots = (rootMeta.pages ?? []).filter(
    (page) => !page.startsWith('---'),
  );

  if (JSON.stringify(configuredRoots) !== JSON.stringify(listedRoots)) {
    fail('content/docs/meta.json and docsNavigationManifest are out of sync');
  }

  const rootIds = new Set<string>(configuredRoots);
  for (const item of docsNavigationManifest) {
    if (!existsSync(resolve(item.contentDirectory))) {
      fail(`missing docs directory: ${item.contentDirectory}`);
    }

    const meta = readJson<DocsMeta>(item.metaFile);
    if (meta.root !== true)
      fail(`top navigation root must set root=true: ${item.id}`);

    const entries = (meta.pages ?? []).filter(
      (page) => !page.startsWith('---'),
    );
    for (const entry of entries) {
      const contentPath = resolve(item.contentDirectory, `${entry}.mdx`);
      if (!existsSync(contentPath)) {
        fail(`sidebar points to missing page: ${item.id} -> ${entry}`);
      }
    }

    const localPages = readdirSync(resolve(item.contentDirectory), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
      .map((entry) => entry.name.replace(/\.mdx$/, ''));
    const listedLocalPages = new Set(
      entries.filter((entry) => !entry.startsWith('../')),
    );
    for (const page of localPages) {
      if (!listedLocalPages.has(page)) {
        fail(`page is missing from sidebar: ${item.id}/${page}`);
      }
    }

    for (const entry of meta.pages ?? []) {
      const referencedRoot = /^\.\.\/([^/]+)\//.exec(entry)?.[1];
      if (referencedRoot && rootIds.has(referencedRoot)) {
        fail(
          `page belongs to more than one top navigation root: ${item.id} -> ${referencedRoot}`,
        );
      }
    }
  }
}

function assertLocalPluginMcp() {
  for (const path of collectFiles(resolve('plugins'))) {
    if (!path.endsWith('.mcp.json')) continue;
    const config = readJson<{
      mcpServers?: Record<string, { command?: string; url?: string }>;
    }>(path);
    for (const [name, server] of Object.entries(config.mcpServers ?? {})) {
      if (server.url)
        fail(`plugin ${name} still uses a remote MCP URL: ${path}`);
      if (server.command !== 'npx')
        fail(`plugin ${name} must use npx stdio MCP: ${path}`);
    }
  }
}

function refreshFumadocsSource() {
  execFileSync('fumadocs-mdx', [], { cwd: rootDir, stdio: 'inherit' });
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data: Record<string, string> = {};
  if (!match) return { data, body: raw.trim() };

  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, '').trim();
  }

  return { data, body: raw.slice(match[0].length).trim() };
}

function fileToSlug(file: string) {
  const contentRoot = resolve('content/docs');
  const relativePath = relative(contentRoot, file)
    .replaceAll('\\', '/')
    .replace(/\.mdx$/, '');
  if (relativePath === 'index') return '';
  return relativePath.endsWith('/index')
    ? relativePath.slice(0, -'/index'.length)
    : relativePath;
}

function mdxToMarkdown(body: string) {
  let value = body
    .replace(/^import\s+[^\n]+$/gm, '')
    .replace(/^export\s+[^\n]+$/gm, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<br\s*\/?\s*>/gi, '\n');

  value = value.replace(
    /<Card\s+([^>]*?)\/>/g,
    (_match, attributes: string) => {
      const title = /title=["']([^"']*)["']/.exec(attributes)?.[1];
      const description = /description=["']([^"']*)["']/.exec(attributes)?.[1];
      const href = /href=["']([^"']*)["']/.exec(attributes)?.[1];
      if (!title) return '';
      const label = href ? `[${title}](${href})` : title;
      return `\n- ${label}${description ? `：${description}` : ''}\n`;
    },
  );

  value = value
    .replace(/<[^>]+>/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\{[^{}\n]*\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return value;
}

function staticMarkdownPath(url: string) {
  const path = url.replace(/^\/+/, '');
  return resolve(publicDir, `${path}.mdx`);
}

function writeText(path: string, value: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
}

async function buildStaticDocuments(): Promise<StaticDoc[]> {
  const pages = collectFiles(resolve('content/docs')).filter((file) =>
    file.endsWith('.mdx'),
  );
  const docs = await Promise.all(
    pages.map(async (file) => {
      const raw = readFileSync(file, 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = fileToSlug(file);
      const title = data.title || slug.split('/').at(-1) || '使用指南';
      const description = data.description || '子比主题开发文档。';
      const url = `/docs${slug ? `/${slug}` : ''}`;
      const markdown = mdxToMarkdown(body);
      const sourcePath = `content/docs/${relative(resolve('content/docs'), file).replaceAll('\\', '/')}`;
      const document = [
        `# ${title}`,
        '',
        `> ${description}`,
        '',
        `Source: ${siteUrl(url)}`,
        '',
        markdown.trim(),
        '',
      ].join('\n');

      writeText(staticMarkdownPath(url), document);
      for (const locale of ['en', 'ja']) {
        writeText(staticMarkdownPath(`/${locale}${url}`), document);
      }
      return { slug, title, description, url, sourcePath, markdown: document };
    }),
  );

  return docs.sort((a, b) => a.url.localeCompare(b.url, 'zh-CN'));
}

function buildStaticIndexes(docs: StaticDoc[]) {
  const indexLines = [
    '# 子比主题开发文档',
    '',
    `> ${projectConfig.siteName} 的公开文档索引。主站发布到 GitHub Pages；文档反馈由独立 GitHub Bot 处理。`,
    '',
    '## 文档列表',
    '',
  ];

  for (const doc of docs) {
    indexLines.push(
      `- [${doc.title}](${siteUrl(doc.url)})：${doc.description}`,
      `  Markdown：${siteUrl(`${doc.url}.mdx`)}`,
    );
  }

  indexLines.push(
    '',
    '## 读取建议',
    '',
    `- 先读取 ${siteUrl('/llms.txt')} 了解目录，再按需读取单篇 Markdown。`,
    `- 需要本地工具调用时，安装 ${projectConfig.mcpPackage}，不要请求网站端 HTTP MCP。`,
  );
  writeText(resolve(publicDir, 'llms.txt'), `${indexLines.join('\n')}\n`);

  const full = [
    '# 子比主题开发文档全文',
    '',
    `Source: ${siteUrl('/')}`,
    '',
    ...docs.flatMap((doc) => [doc.markdown, '---', '']),
  ].join('\n');
  writeText(resolve(publicDir, 'llms-full.txt'), full);

  const resources = docs.map((doc) => ({
    uri: `zibll-docs://docs/${doc.slug || 'index'}`,
    name: doc.title,
    title: doc.title,
    description: doc.description,
    mimeType: 'text/markdown',
    slug: doc.slug,
    url: siteUrl(doc.url),
    markdownUrl: siteUrl(`${doc.url}.mdx`),
  }));
  writeText(
    resolve(publicDir, 'mcp/resources.json'),
    `${JSON.stringify(resources, null, 2)}\n`,
  );
  writeText(
    resolve(publicDir, 'mcp/manifest.json'),
    `${JSON.stringify(
      {
        name: 'zibll-docs',
        title: projectConfig.siteName,
        description: projectConfig.description,
        version: '0.1.0',
        transport: 'stdio',
        package: projectConfig.mcpPackage,
        command: 'npx',
        args: ['-y', projectConfig.mcpPackage],
        resourcesUrl: siteUrl('/mcp/resources.json'),
        docsUrl: siteUrl('/docs/mcp'),
        resources,
      },
      null,
      2,
    )}\n`,
  );

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[
      siteUrl('/'),
      siteUrl('/friends'),
      siteUrl('/en'),
      siteUrl('/ja'),
      siteUrl('/en/friends'),
      siteUrl('/ja/friends'),
      ...docs.flatMap((doc) => [
        siteUrl(doc.url),
        siteUrl(`/en${doc.url}`),
        siteUrl(`/ja${doc.url}`),
      ]),
    ].map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  writeText(resolve(publicDir, 'sitemap.xml'), sitemap);
  writeText(
    resolve(publicDir, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl('/sitemap.xml')}\n`,
  );

  if (existsSync(resolve('.agents/plugins/marketplace.json'))) {
    writeText(
      resolve(publicDir, 'marketplace.json'),
      readFileSync(resolve('.agents/plugins/marketplace.json'), 'utf8'),
    );
  }
}

async function main() {
  assertRemovedPaths();
  assertNoRuntimeEnvReads();
  assertStaticDocsRoute();
  assertNavigationManifest();
  assertLocalPluginMcp();

  mkdirSync(resolve('.generated'), { recursive: true });
  // `out` is an ignored export directory. Clear it before the next export so
  // deleted routes cannot remain reachable from an older build.
  rmSync(resolve('out'), { recursive: true, force: true });
  // Remove every generated locale before writing the current document set.
  // Without this, a deleted page can remain publicly reachable as a stale
  // Markdown asset even though Fumadocs no longer generates its HTML route.
  for (const generatedPath of [
    'docs',
    'en/docs',
    'ja/docs',
    'docs.mdx',
    'en/docs.mdx',
    'ja/docs.mdx',
    'llms.txt',
    'llms-full.txt',
    'mcp',
    'sitemap.xml',
    'robots.txt',
    'marketplace.json',
  ]) {
    rmSync(resolve(publicDir, generatedPath), {
      recursive: true,
      force: true,
    });
  }

  refreshFumadocsSource();
  const docs = await buildStaticDocuments();
  buildStaticIndexes(docs);
  execFileSync(process.execPath, [resolve('scripts/generate-mcp-data.mjs')], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(
    `[zibll-docs] generated ${docs.length} static documents and MCP data`,
  );
}

await main();
