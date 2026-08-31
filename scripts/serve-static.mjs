#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'out');
const port = 3000;
const previewBasePath = (process.env.PREVIEW_BASE_PATH || '').replace(
  /\/+$/,
  '',
);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mdx': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded.replace(/^\/+/, '');
  const candidate = path.resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`)
    ? candidate
    : undefined;
}

async function resolveFile(urlPath) {
  const candidate = safePath(urlPath);
  if (!candidate) return undefined;
  const candidates = [candidate];
  if (urlPath.endsWith('/'))
    candidates.unshift(path.join(candidate, 'index.html'));
  else candidates.push(`${candidate}.html`, path.join(candidate, 'index.html'));
  for (const file of candidates) {
    const stat = await fs.stat(file).catch(() => undefined);
    if (stat?.isFile()) return file;
  }
  return undefined;
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    let pathname = requestUrl.pathname;
    if (
      previewBasePath &&
      (pathname === previewBasePath ||
        pathname.startsWith(`${previewBasePath}/`))
    ) {
      pathname = pathname.slice(previewBasePath.length) || '/';
    }
    const file = await resolveFile(`${pathname}${requestUrl.search}`);
    if (!file) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const extension = path.extname(file).toLowerCase();
    response.writeHead(200, {
      'cache-control': 'no-cache',
      'content-type': mimeTypes[extension] || 'application/octet-stream',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
  }
});

server.listen(port, '0.0.0.0', () => {
  const suffix = previewBasePath || '';
  console.log(`[zibll-docs] static preview: http://127.0.0.1:${port}${suffix}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
