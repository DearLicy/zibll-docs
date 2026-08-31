import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DATA_FILE = path.join(PACKAGE_ROOT, 'data', 'docs.json');
const REPOSITORY_DOCS = path.resolve(PACKAGE_ROOT, '../../content/docs');
const RESOURCE_PREFIX = 'zibll-docs://docs/';
const DEFAULT_SITE_URL = 'https://dearlicy.github.io/zibll-docs';
const MAX_SOURCE_FILE_BYTES = 256 * 1024;
const MAX_SOURCE_RESULTS = 5000;
const IGNORED_SOURCE_PARTS = new Set([
  '.git',
  '.next',
  'node_modules',
  'vendor',
  'cache',
  '逆向缓存',
]);
const SENSITIVE_SOURCE_NAMES = new Set([
  '.env',
  '.env.local',
  'wp-config.php',
  'id_rsa',
  'credentials.json',
]);

function normalizeSlug(value = '') {
  try {
    const decoded = decodeURIComponent(String(value));
    const withoutPrefix = decoded.replace(/^\/?docs\/?/, '');
    return withoutPrefix.replace(/^\/+|\/+$/g, '') || '';
  } catch {
    return undefined;
  }
}

function sourceSlug(doc) {
  return doc.slug || 'index';
}

function documentUrl(doc) {
  return doc.url || `${DEFAULT_SITE_URL}/docs${doc.slug ? `/${doc.slug}` : ''}`;
}

function termsFor(query) {
  const normalized = query.toLocaleLowerCase('zh-CN').trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 1) return [...new Set([normalized, ...words])];
  if (normalized.length <= 2) return [normalized];
  const bigrams = Array.from({ length: normalized.length - 1 }, (_, index) =>
    normalized.slice(index, index + 2),
  );
  return [...new Set([normalized, ...bigrams])];
}

function rankDocuments(docs, query, limit) {
  const terms = termsFor(query);
  return docs
    .map((doc) => {
      const haystack =
        `${doc.title}\n${doc.description}\n${doc.markdown}`.toLocaleLowerCase(
          'zh-CN',
        );
      const score = terms.reduce((total, term) => {
        if (!term) return total;
        const matches = haystack.split(term).length - 1;
        return total + Math.min(matches, 6);
      }, 0);
      return { doc, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        sourceSlug(a.doc).localeCompare(sourceSlug(b.doc), 'zh-CN'),
    )
    .slice(0, limit);
}

function excerpt(text, query, maxLength = 320) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const index = clean
    .toLocaleLowerCase('zh-CN')
    .indexOf(query.toLocaleLowerCase('zh-CN'));
  if (index < 0) return clean.slice(0, maxLength);
  return clean
    .slice(Math.max(0, index - 100), index + query.length + 180)
    .trim();
}

function markdownOutline(text) {
  return Array.from(text.matchAll(/^(#{1,6})\s+(.+)$/gm)).map((match) => {
    const title = match[2].replace(/\s+#*$/, '').trim();
    return `${'  '.repeat(Math.max(0, match[1].length - 1))}- ${title}`;
  });
}

function codeBlocks(text) {
  return Array.from(text.matchAll(/```([^\n`]*)\n([\s\S]*?)```/g)).map(
    (match) => ({
      language: match[1].trim().split(/\s+/)[0] || 'text',
      code: match[2].trim(),
    }),
  );
}

async function walkMarkdown(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdown(fullPath);
      return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = {};
  if (!match) return { data, body: raw.trim() };
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return { data, body: raw.slice(match[0].length).trim() };
}

function fileSlug(file, docsRoot) {
  const relative = path
    .relative(docsRoot, file)
    .replaceAll('\\', '/')
    .replace(/\.mdx$/, '');
  if (relative === 'index') return '';
  return relative.endsWith('/index')
    ? relative.slice(0, -'/index'.length)
    : relative;
}

async function loadDocsFromSource() {
  const sourceStat = await fs.stat(REPOSITORY_DOCS).catch(() => undefined);
  if (!sourceStat?.isDirectory()) {
    throw new Error(
      'MCP documentation data is missing. Run `npm run mcp:prepare` in the repository before starting the server.',
    );
  }
  const files = await walkMarkdown(REPOSITORY_DOCS);
  const docs = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(file, 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = fileSlug(file, REPOSITORY_DOCS);
      const title = data.title || slug.split('/').at(-1) || '使用指南';
      const description = data.description || '子比主题开发文档。';
      const url = `${SITE_URL}/docs${slug ? `/${slug}` : ''}`;
      return {
        slug,
        title,
        description,
        url,
        sourcePath: path.relative(process.cwd(), file).replaceAll('\\', '/'),
        markdown: `# ${title}\n\n> ${description}\n\nSource: ${url}\n\n${body}`,
      };
    }),
  );
  return docs.sort((a, b) => a.url.localeCompare(b.url, 'zh-CN'));
}

async function loadDocs() {
  try {
    const value = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    if (
      Array.isArray(value.docs) &&
      value.docs.length > 0 &&
      value.docs.every(
        (doc) =>
          typeof doc?.slug === 'string' &&
          typeof doc?.title === 'string' &&
          typeof doc?.markdown === 'string' &&
          !doc.markdown.includes('/docs/installation'),
      )
    ) {
      return value.docs;
    }
  } catch {
    // Source checkout before the static build: read the Markdown tree directly.
  }
  return loadDocsFromSource();
}

function parseSourceDir(args) {
  const index = args.indexOf('--source-dir');
  if (index < 0 || !args[index + 1]) return undefined;
  return path.resolve(args[index + 1]);
}

function isIgnoredSourcePath(relativePath) {
  const parts = relativePath.split(path.sep);
  return (
    parts.some((part) => IGNORED_SOURCE_PARTS.has(part)) ||
    SENSITIVE_SOURCE_NAMES.has(parts.at(-1)) ||
    parts.at(-1)?.startsWith('.env')
  );
}

function ensureInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

async function sourceFiles(sourceRoot) {
  if (!sourceRoot) return [];
  const result = [];
  async function walk(directory) {
    if (result.length >= MAX_SOURCE_RESULTS) return;
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (result.length >= MAX_SOURCE_RESULTS) break;
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(sourceRoot, fullPath);
      if (isIgnoredSourcePath(relative)) continue;
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        if (stat.size <= MAX_SOURCE_FILE_BYTES)
          result.push(relative.replaceAll('\\', '/'));
      }
    }
  }
  await walk(sourceRoot);
  return result.sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

async function resolveSourceFile(sourceRoot, relativePath) {
  if (!sourceRoot || !relativePath || path.isAbsolute(relativePath))
    return undefined;
  const candidate = path.resolve(sourceRoot, relativePath);
  if (!ensureInside(sourceRoot, candidate)) return undefined;
  const relative = path.relative(sourceRoot, candidate);
  if (isIgnoredSourcePath(relative)) return undefined;
  const stat = await fs.stat(candidate).catch(() => undefined);
  if (!stat?.isFile() || stat.size > MAX_SOURCE_FILE_BYTES) return undefined;
  return candidate;
}

function findDoc(docs, slug) {
  const normalized = normalizeSlug(slug);
  if (normalized === undefined) return undefined;
  return docs.find((doc) => doc.slug === normalized);
}

function resourceText(doc) {
  return `- ${doc.title}\n  URI: ${RESOURCE_PREFIX}${sourceSlug(doc)}\n  URL: ${documentUrl(doc)}\n  Slug: ${sourceSlug(doc)}\n  ${doc.description}`;
}

export function createDocsMcpServer(docs, { sourceRoot } = {}) {
  const server = new McpServer({
    name: 'zibll-docs',
    title: '子比主题开发文档',
    version: '0.1.0',
  });

  const template = new ResourceTemplate('zibll-docs://docs/{+slug}', {
    complete: {
      slug: (value) =>
        docs
          .map(sourceSlug)
          .filter((slug) => slug.startsWith(value))
          .slice(0, 100),
    },
  });
  server.registerResource(
    'documentation',
    template,
    {
      title: '子比主题开发文档',
      description: '按 slug 读取单篇公开文档。',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const doc = findDoc(
        docs,
        Array.isArray(variables.slug)
          ? variables.slug.join('/')
          : variables.slug,
      );
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'text/markdown',
            text: doc?.markdown || `没有找到文档：${variables.slug}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'list_docs',
    {
      title: '列出文档',
      description: '列出当前版本公开的全部子比主题开发文档。',
    },
    async () => ({
      content: [{ type: 'text', text: docs.map(resourceText).join('\n\n') }],
    }),
  );

  server.registerTool(
    'read_doc',
    {
      title: '读取文档',
      description: '按 slug 读取单篇文档。首页使用 index。',
      inputSchema: {
        slug: z.string().describe('文档 slug，例如 api/functions。'),
      },
    },
    async ({ slug }) => {
      const doc = findDoc(docs, slug);
      if (!doc)
        return {
          isError: true,
          content: [{ type: 'text', text: `没有找到文档：${slug}` }],
        };
      return { content: [{ type: 'text', text: doc.markdown }] };
    },
  );

  server.registerTool(
    'search_docs',
    {
      title: '搜索文档',
      description: '搜索文档标题、描述和正文，返回带 URL 的相关结果。',
      inputSchema: {
        query: z.string().min(1).describe('搜索关键词。'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe('结果数量，默认 8。'),
      },
    },
    async ({ query, limit = 8 }) => {
      const results = rankDocuments(docs, query, limit);
      const text = results.length
        ? results
            .map(
              ({ doc, score }) =>
                `- ${doc.title}\n  URL: ${documentUrl(doc)}\n  Slug: ${sourceSlug(doc)}\n  Score: ${score}\n  ${excerpt(doc.markdown, query)}`,
            )
            .join('\n\n')
        : `没有找到相关文档：${query}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'read_docs_bundle',
    {
      title: '读取相关文档包',
      description: '按关键词读取少量相关页面，适合开始任务前装载上下文。',
      inputSchema: {
        query: z.string().min(1).describe('主题关键词。'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe('页面数量，默认 3。'),
      },
    },
    async ({ query, limit = 3 }) => {
      const results = rankDocuments(docs, query, limit);
      const text = results.length
        ? results
            .map(
              ({ doc, score }) =>
                `<!-- ${doc.title} | ${documentUrl(doc)} | score: ${score} -->\n\n${doc.markdown}`,
            )
            .join('\n\n---\n\n')
        : `没有找到相关文档：${query}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'doc_outline',
    {
      title: '查看文档大纲',
      description: '按 slug 返回 Markdown 标题大纲。',
      inputSchema: {
        slug: z.string().describe('文档 slug，例如 codestar-framework。'),
      },
    },
    async ({ slug }) => {
      const doc = findDoc(docs, slug);
      if (!doc)
        return {
          isError: true,
          content: [{ type: 'text', text: `没有找到文档：${slug}` }],
        };
      const outline = markdownOutline(doc.markdown);
      return {
        content: [
          {
            type: 'text',
            text: outline.length ? outline.join('\n') : '该文档没有标题大纲。',
          },
        ],
      };
    },
  );

  server.registerTool(
    'find_code_examples',
    {
      title: '查找代码示例',
      description: '按关键词查找文档中的 fenced code block。',
      inputSchema: {
        query: z.string().min(1).describe('代码或主题关键词。'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe('代码块数量，默认 5。'),
      },
    },
    async ({ query, limit = 5 }) => {
      const results = rankDocuments(docs, query, docs.length).flatMap(
        ({ doc }) => codeBlocks(doc.markdown).map((block) => ({ doc, block })),
      );
      const filtered = results
        .filter(({ doc, block }) =>
          `${doc.title}\n${doc.description}\n${block.language}\n${block.code}`
            .toLocaleLowerCase('zh-CN')
            .includes(query.toLocaleLowerCase('zh-CN')),
        )
        .slice(0, limit);
      const text = filtered.length
        ? filtered
            .map(
              ({ doc, block }) =>
                `## ${doc.title}\nURL: ${documentUrl(doc)}\n\n\`\`\`${block.language}\n${block.code.slice(0, 1800)}\n\`\`\``,
            )
            .join('\n\n')
        : `没有找到代码示例：${query}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'list_source_files',
    {
      title: '列出本地源码文件',
      description:
        '只读列出通过 --source-dir 挂载的本地主题、子主题或插件文件。',
    },
    async () => {
      if (!sourceRoot)
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: '未配置 --source-dir；该工具只读取用户主动挂载的本地目录。',
            },
          ],
        };
      const files = await sourceFiles(sourceRoot);
      return {
        content: [
          {
            type: 'text',
            text: files.length
              ? files.join('\n')
              : '没有找到可读取的文本文件。',
          },
        ],
      };
    },
  );

  server.registerTool(
    'read_source_file',
    {
      title: '读取本地源码文件',
      description:
        '只读读取挂载目录中的单个源码文件，不允许写入或访问目录外文件。',
      inputSchema: {
        path: z.string().min(1).describe('相对于 --source-dir 的文件路径。'),
      },
    },
    async ({ path: relativePath }) => {
      if (!sourceRoot)
        return {
          isError: true,
          content: [{ type: 'text', text: '未配置 --source-dir。' }],
        };
      const file = await resolveSourceFile(sourceRoot, relativePath);
      if (!file)
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `文件不存在、超出目录或被安全规则忽略：${relativePath}`,
            },
          ],
        };
      const text = await fs.readFile(file, 'utf8');
      return {
        content: [{ type: 'text', text: `// ${relativePath}\n\n${text}` }],
      };
    },
  );

  return server;
}

export async function run(args = []) {
  const docs = await loadDocs();
  const explicitSourceRoot = parseSourceDir(args);
  const detectedSourceRoot =
    explicitSourceRoot || path.resolve(process.cwd(), '主题插件子主题');
  const sourceRoot = await fs
    .stat(detectedSourceRoot)
    .then((stat) => (stat.isDirectory() ? detectedSourceRoot : undefined))
    .catch(() => undefined);
  const server = createDocsMcpServer(docs, { sourceRoot });
  await server.connect(new StdioServerTransport());
  console.error(
    `zibll-docs MCP ready: ${docs.length} docs${sourceRoot ? `; source: ${sourceRoot}` : ''}`,
  );
}
