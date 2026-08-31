#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const docsRoot = path.join(rootDir, 'content', 'docs');
const packageRoot = path.join(rootDir, 'packages', 'zibll-docs-mcp');
const outputPath = path.join(packageRoot, 'data', 'docs.json');
const defaultSiteUrl = 'https://dearlicy.github.io/zibll-docs';

function publicUrl(value) {
  const siteUrl = String(
    process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  ).replace(/\/+$/, '');
  const pathname = value.startsWith('/') ? value : `/${value}`;
  return `${siteUrl}${pathname}`;
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

function mdxToMarkdown(body) {
  let value = body
    .replace(/^import\s+[^\n]+$/gm, '')
    .replace(/^export\s+[^\n]+$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?\s*>/gi, '\n');

  value = value.replace(/<Card\s+([^>]*?)\/>/g, (_match, attributes) => {
    const title = /title=["']([^"']*)["']/.exec(attributes)?.[1];
    const description = /description=["']([^"']*)["']/.exec(attributes)?.[1];
    const href = /href=["']([^"']*)["']/.exec(attributes)?.[1];
    if (!title) return '';
    const label = href ? `[${title}](${href})` : title;
    return `\n- ${label}${description ? `：${description}` : ''}\n`;
  });

  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\{[^{}\n]*\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(file);
  }
  return files;
}

function slugFor(file) {
  const relative = path
    .relative(docsRoot, file)
    .replaceAll(path.sep, '/')
    .replace(/\.mdx$/, '');
  if (relative === 'index') return '';
  return relative.endsWith('/index')
    ? relative.slice(0, -'/index'.length)
    : relative;
}

async function main() {
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf8'),
  );
  const files = (await walk(docsRoot)).sort((a, b) =>
    a.localeCompare(b, 'zh-CN'),
  );
  const docs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(file, 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = slugFor(file);
      const url = `/docs${slug ? `/${slug}` : ''}`;
      const title = data.title || slug.split('/').at(-1) || '使用指南';
      const description = data.description || '子比主题开发文档。';
      const markdown = [
        `# ${title}`,
        '',
        `> ${description}`,
        '',
        `Source: ${publicUrl(url)}`,
        '',
        mdxToMarkdown(body),
        '',
      ].join('\n');

      return {
        slug,
        title,
        description,
        url: publicUrl(url),
        sourcePath: path.relative(rootDir, file).replaceAll(path.sep, '/'),
        markdown,
      };
    }),
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        name: 'zibll-docs',
        title: '子比主题开发文档',
        description:
          '由社区共同维护的子比主题二次开发文档，覆盖插件、子主题、Codestar Framework、MCP 与 Codex 插件。',
        version: packageJson.version,
        docs,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`[zibll-docs] generated MCP package data (${docs.length} docs)`);
}

await main();
