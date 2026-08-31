import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve('out');

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

function fail(message) {
  throw new Error(`[zibll-docs] Pages export check failed: ${message}`);
}

function read(path) {
  const absolutePath = resolve(root, path);
  if (!existsSync(absolutePath)) fail(`missing out/${path}`);
  return readFileSync(absolutePath, 'utf8');
}

function collectHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

const basePath = argument(
  '--base-path',
  process.env.NEXT_PUBLIC_BASE_PATH || '',
).replace(/\/+$/, '');
const siteUrl = argument(
  '--site-url',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://dearlicy.github.io/zibll-docs',
).replace(/\/+$/, '');

if (basePath && !/^\/[A-Za-z0-9._~/-]+$/.test(basePath)) {
  fail(`invalid base path: ${basePath}`);
}
const parsedSiteUrl = new URL(siteUrl);
if (parsedSiteUrl.protocol !== 'https:') fail('site URL must use HTTPS');
if (basePath && !parsedSiteUrl.pathname.endsWith(basePath)) {
  fail(`site URL does not include base path ${basePath}`);
}

const pages = [
  ['index.html', '/'],
  ['docs/index.html', '/docs/'],
  ['friends/index.html', '/friends/'],
  ['en/index.html', '/en/'],
  ['en/docs/index.html', '/en/docs/'],
  ['ja/index.html', '/ja/'],
  ['ja/docs/index.html', '/ja/docs/'],
];

for (const [file, route] of pages) {
  const html = read(file);
  const canonical = `${siteUrl}${route}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) {
    fail(`${file} has an unexpected canonical URL`);
  }
}

for (const file of [
  'llms.txt',
  'llms-full.txt',
  'mcp/manifest.json',
  'mcp/resources.json',
  'robots.txt',
  'sitemap.xml',
]) {
  const content = read(file);
  if (content.includes('http://localhost') || content.includes('127.0.0.1')) {
    fail(`${file} contains a loopback public URL`);
  }
  if (!content.includes(siteUrl)) fail(`${file} does not use ${siteUrl}`);
}

if (basePath) {
  const rootAttribute = /\b(?:action|href|src)="(\/[^"?#]*)"/g;
  for (const file of collectHtml(root)) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(rootAttribute)) {
      const value = match[1].replace(/\/+$/, '') || '/';
      if (value !== basePath && !value.startsWith(`${basePath}/`)) {
        fail(
          `${relative(root, file)} contains an unprefixed URL attribute: ${match[1]}`,
        );
      }
    }
  }

  const homepage = read('index.html');
  for (const value of [`${basePath}/_next/`, `${basePath}/docs/`]) {
    if (!homepage.includes(value)) fail(`homepage is missing ${value}`);
  }
}

console.log(
  `[zibll-docs] Pages export check passed (${basePath || '/'} -> ${siteUrl})`,
);
