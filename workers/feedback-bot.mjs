const GITHUB_API = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_TITLE_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 6000;
const MAX_PAGE_LENGTH = 2048;

let signingKeyPromise;
let installationTokenCache;

class ConfigurationError extends Error {}

class GitHubApiError extends Error {
  constructor(status) {
    super(`GitHub API request failed with status ${status}`);
    this.status = status;
  }
}

function jsonResponse(value, status, origin) {
  const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  };
  if (origin) {
    headers['access-control-allow-credentials'] = 'false';
    headers['access-control-allow-headers'] = 'content-type';
    headers['access-control-allow-methods'] = 'POST, OPTIONS';
    headers['access-control-allow-origin'] = origin;
    headers.vary = 'Origin';
  }
  return new Response(JSON.stringify(value), { status, headers });
}

function normalizeOrigin(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function allowedOrigin(request, env) {
  const origin = normalizeOrigin(request.headers.get('Origin'));
  if (!origin) return '';
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);
  return configured.includes(origin) ? origin : '';
}

function requiredConfig(env) {
  const names = [
    'GITHUB_APP_ID',
    'GITHUB_APP_PRIVATE_KEY',
    'GITHUB_APP_INSTALLATION_ID',
    'GITHUB_REPOSITORY_OWNER',
    'GITHUB_REPOSITORY_NAME',
    'PUBLIC_SITE_URL',
  ];
  const missing = names.filter((name) => !String(env[name] || '').trim());
  if (missing.length) {
    throw new ConfigurationError(
      `Missing configuration: ${missing.join(', ')}`,
    );
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  const cleaned = value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim();
  return cleaned.length <= maxLength ? cleaned : '';
}

function validatePage(value, configuredSiteUrl) {
  const page = cleanText(value, MAX_PAGE_LENGTH);
  if (!page) return '';

  try {
    const expected = new URL(configuredSiteUrl);
    const actual = new URL(page);
    if (
      !['http:', 'https:'].includes(expected.protocol) ||
      actual.origin !== expected.origin ||
      actual.username ||
      actual.password
    ) {
      return '';
    }

    const expectedPath = expected.pathname.replace(/\/+$/, '');
    const actualPath = actual.pathname.replace(/\/+$/, '');
    if (
      expectedPath &&
      actualPath !== expectedPath &&
      !actualPath.startsWith(`${expectedPath}/`)
    ) {
      return '';
    }

    return actual.toString();
  } catch {
    return '';
  }
}

function parseLabels(value) {
  return String(value || '')
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function base64Url(value) {
  const bytes =
    value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function derLength(length) {
  if (length < 128) return Uint8Array.of(length);
  const bytes = [];
  let remaining = length;
  while (remaining > 0) {
    bytes.unshift(remaining & 0xff);
    remaining >>>= 8;
  }
  return Uint8Array.from([0x80 | bytes.length, ...bytes]);
}

function derElement(tag, content) {
  const length = derLength(content.length);
  const output = new Uint8Array(1 + length.length + content.length);
  output[0] = tag;
  output.set(length, 1);
  output.set(content, 1 + length.length);
  return output;
}

function concatBytes(...values) {
  const output = new Uint8Array(
    values.reduce((total, value) => total + value.length, 0),
  );
  let offset = 0;
  for (const value of values) {
    output.set(value, offset);
    offset += value.length;
  }
  return output;
}

function toArrayBuffer(value) {
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  );
}

function pemToPkcs8(pem) {
  const normalized = String(pem).replace(/\\n/g, '\n').trim();
  const match = normalized.match(
    /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]+?)-----END \1-----/,
  );
  if (!match)
    throw new ConfigurationError('The GitHub private key is not valid PEM');

  const derText = match[2].replace(/\s/g, '');
  let binary;
  try {
    binary = atob(derText);
  } catch {
    throw new ConfigurationError('The GitHub private key is not valid base64');
  }

  const key = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (match[1] === 'PRIVATE KEY') return key;
  if (match[1] !== 'RSA PRIVATE KEY') {
    throw new ConfigurationError(
      'Only RSA GitHub App private keys are supported',
    );
  }

  // Web Crypto imports PKCS#8. GitHub may provide the older PKCS#1 RSA PEM,
  // so wrap it in the standard PrivateKeyInfo container first.
  const version = Uint8Array.from([0x02, 0x01, 0x00]);
  const algorithm = Uint8Array.from([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01,
    0x01, 0x05, 0x00,
  ]);
  return derElement(
    0x30,
    concatBytes(version, algorithm, derElement(0x04, key)),
  );
}

async function signingKey(env) {
  if (!signingKeyPromise) {
    signingKeyPromise = crypto.subtle
      .importKey(
        'pkcs8',
        toArrayBuffer(pemToPkcs8(env.GITHUB_APP_PRIVATE_KEY)),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign'],
      )
      .catch((error) => {
        signingKeyPromise = undefined;
        throw error;
      });
  }
  return signingKeyPromise;
}

async function appJwt(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 540,
      iss: String(env.GITHUB_APP_ID).trim(),
    }),
  );
  const input = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    await signingKey(env),
    new TextEncoder().encode(input),
  );
  return `${input}.${base64Url(new Uint8Array(signature))}`;
}

async function githubFetch(path, init = {}) {
  return fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'zibll-docs-feedback-bot',
      'x-github-api-version': GITHUB_API_VERSION,
      ...(init.headers || {}),
    },
  });
}

async function installationToken(env) {
  if (
    installationTokenCache &&
    installationTokenCache.expiresAt > Date.now() + 60_000
  ) {
    return installationTokenCache.value;
  }

  const response = await githubFetch(
    `/app/installations/${encodeURIComponent(env.GITHUB_APP_INSTALLATION_ID)}/access_tokens`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${await appJwt(env)}` },
    },
  );
  if (!response.ok) throw new GitHubApiError(response.status);

  const result = await response.json();
  if (typeof result.token !== 'string') throw new GitHubApiError(502);
  const expiresAt =
    Date.parse(result.expires_at || '') || Date.now() + 3_300_000;
  installationTokenCache = { value: result.token, expiresAt };
  return result.token;
}

async function createIssue(env, issue) {
  const owner = encodeURIComponent(String(env.GITHUB_REPOSITORY_OWNER).trim());
  const repo = encodeURIComponent(String(env.GITHUB_REPOSITORY_NAME).trim());
  const labels = parseLabels(env.GITHUB_ISSUE_LABELS);
  const body = { title: issue.title, body: issue.body };
  if (labels.length) body.labels = labels;

  async function send(payload) {
    return githubFetch(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await installationToken(env)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  let response = await send(body);
  if (response.status === 401) {
    installationTokenCache = undefined;
    response = await send(body);
  }

  // A missing optional label should not prevent a user's feedback from being
  // recorded. Retry once without labels when GitHub rejects the label list.
  if (response.status === 422 && labels.length) {
    installationTokenCache = undefined;
    response = await send({ title: issue.title, body: issue.body });
  }

  if (!response.ok) throw new GitHubApiError(response.status);
  const result = await response.json();
  if (typeof result.html_url !== 'string') throw new GitHubApiError(502);
  return result.html_url;
}

function feedbackIssue({ title, page, opinion, message }) {
  const opinionText = opinion === 'good' ? '有帮助' : '没帮助';
  return {
    title: `[docs-feedback] ${title}`,
    body: [
      '<!-- zibll-docs-feedback -->',
      '## 文档反馈',
      '',
      `- 页面：<${page}>`,
      `- 评价：${opinionText}`,
      '',
      '### 反馈内容',
      '',
      message,
      '',
      '---',
      '此 Issue 由子比主题开发文档 GitHub App Bot 创建。',
    ].join('\n'),
  };
}

async function handleFeedback(request, env, origin) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: 'Request body is too large' }, 413, origin);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: 'Request body is too large' }, 413, origin);
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, origin);
  }

  const opinion = input?.opinion;
  const title = cleanText(input?.title, MAX_TITLE_LENGTH);
  const message = cleanText(input?.message, MAX_MESSAGE_LENGTH);
  const page = validatePage(input?.page, env.PUBLIC_SITE_URL);
  if (!['good', 'bad'].includes(opinion) || !title || !message || !page) {
    return jsonResponse({ error: 'Invalid feedback payload' }, 400, origin);
  }

  const githubUrl = await createIssue(
    env,
    feedbackIssue({ title, page, opinion, message }),
  );
  return jsonResponse({ githubUrl }, 201, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    if (request.method === 'OPTIONS') {
      return origin
        ? jsonResponse({ ok: true }, 200, origin)
        : jsonResponse({ error: 'Origin is not allowed' }, 403, '');
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse(
        { ok: true, service: 'zibll-docs-feedback' },
        200,
        origin,
      );
    }

    if (url.pathname !== '/feedback' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }
    if (!origin) {
      return jsonResponse({ error: 'Origin is not allowed' }, 403, '');
    }

    try {
      requiredConfig(env);
      return await handleFeedback(request, env, origin);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        console.error(error.message);
        return jsonResponse(
          { error: 'Feedback service is not configured' },
          503,
          origin,
        );
      }
      if (error instanceof GitHubApiError) {
        console.error(error.message);
      } else {
        console.error('Feedback request failed', error);
      }
      return jsonResponse(
        { error: 'Unable to create GitHub issue' },
        502,
        origin,
      );
    }
  },
};
