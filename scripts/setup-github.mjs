#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const labelsPath = resolve(root, '.github/labels.json');

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

const repository = argument(
  '--repo',
  process.env.GITHUB_REPOSITORY || 'DearLicy/zibll-docs',
);
const siteUrl = argument(
  '--site-url',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://dearlicy.github.io/zibll-docs',
).replace(/\/+$/, '');
const feedbackEndpoint = argument(
  '--feedback-endpoint',
  process.env.FEEDBACK_ENDPOINT || '',
).trim();
const protectedBranch = argument('--branch', 'main');

if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
  throw new Error('仓库必须使用 owner/name 格式。');
}
if (!existsSync(labelsPath)) {
  throw new Error('缺少 .github/labels.json。');
}
if (feedbackEndpoint) {
  const url = new URL(feedbackEndpoint);
  if (url.protocol !== 'https:' || !url.pathname.endsWith('/feedback')) {
    throw new Error('反馈地址必须是以 /feedback 结尾的 HTTPS URL。');
  }
}

const [owner, repo] = repository.split('/');
const endpoint = `repos/${owner}/${repo}`;

function run(command, args, { input, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    input,
  });

  if (result.status !== 0 && !allowFailure) {
    const message = (result.stderr || result.stdout || '').trim();
    throw new Error(message || `${command} 执行失败。`);
  }
  return result;
}

function api(method, path, payload, allowFailure = false) {
  const args = ['api', '--method', method, path];
  let input;
  if (payload !== undefined) {
    args.push('--input', '-');
    input = JSON.stringify(payload);
  }
  const result = run('gh', args, { input, allowFailure });
  if (result.status !== 0) return null;
  const output = result.stdout.trim();
  return output ? JSON.parse(output) : {};
}

run('gh', ['auth', 'status', '--hostname', 'github.com']);
const repositoryInfo = api('GET', endpoint);
if (repositoryInfo.full_name?.toLowerCase() !== repository.toLowerCase()) {
  throw new Error(`无法确认目标仓库：${repository}`);
}

api('PATCH', endpoint, {
  description:
    '子比主题二次开发社区文档，覆盖插件、子主题、Codestar Framework、MCP 与 Codex 插件。',
  homepage: siteUrl,
  has_issues: true,
  has_projects: false,
  has_wiki: false,
  has_discussions: true,
  allow_squash_merge: true,
  allow_merge_commit: false,
  allow_rebase_merge: true,
  delete_branch_on_merge: true,
});

const actionsPermissions = api(
  'PUT',
  `${endpoint}/actions/permissions/workflow`,
  {
    default_workflow_permissions: 'read',
    can_approve_pull_request_reviews: true,
  },
  true,
);
api('PUT', `${endpoint}/vulnerability-alerts`, undefined, true);
api('PUT', `${endpoint}/automated-security-fixes`, undefined, true);

api('PUT', `${endpoint}/topics`, {
  names: [
    'zibll',
    'wordpress',
    'fumadocs',
    'documentation',
    'codestar-framework',
    'model-context-protocol',
    'codex-plugin',
    'github-pages',
  ],
});

const labels = JSON.parse(readFileSync(labelsPath, 'utf8'));
const existingLabels = api('GET', `${endpoint}/labels?per_page=100`);
const existingByName = new Map(
  existingLabels.map((label) => [label.name.toLowerCase(), label]),
);

for (const label of labels) {
  const existing = existingByName.get(label.name.toLowerCase());
  if (existing) {
    api('PATCH', `${endpoint}/labels/${encodeURIComponent(existing.name)}`, {
      new_name: label.name,
      color: label.color,
      description: label.description,
    });
  } else {
    api('POST', `${endpoint}/labels`, label);
  }
}

let feedbackVariable = null;
if (feedbackEndpoint) {
  const variablePath = `${endpoint}/actions/variables/FEEDBACK_ENDPOINT`;
  const existingVariable = api('GET', variablePath, undefined, true);
  feedbackVariable = existingVariable
    ? api('PATCH', variablePath, {
        name: 'FEEDBACK_ENDPOINT',
        value: feedbackEndpoint,
      })
    : api('POST', `${endpoint}/actions/variables`, {
        name: 'FEEDBACK_ENDPOINT',
        value: feedbackEndpoint,
      });
}

const pages = api('GET', `${endpoint}/pages`, undefined, true);
const pagesMethod = pages ? 'PUT' : 'POST';
const pagesResult = api(
  pagesMethod,
  `${endpoint}/pages`,
  { build_type: 'workflow' },
  true,
);

const branch = api(
  'GET',
  `${endpoint}/branches/${encodeURIComponent(protectedBranch)}`,
  undefined,
  true,
);
const branchProtection = branch
  ? api(
      'PUT',
      `${endpoint}/branches/${encodeURIComponent(protectedBranch)}/protection`,
      {
        required_status_checks: {
          strict: true,
          contexts: ['Validate and build'],
        },
        enforce_admins: false,
        required_pull_request_reviews: null,
        restrictions: null,
        required_conversation_resolution: true,
        allow_force_pushes: false,
        allow_deletions: false,
      },
      true,
    )
  : null;

const verifiedRepository = api('GET', endpoint);
const verifiedTopics = api('GET', `${endpoint}/topics`);
const verifiedLabels = api('GET', `${endpoint}/labels?per_page=100`);
const missingLabels = labels.filter(
  (label) =>
    !verifiedLabels.some(
      (current) => current.name.toLowerCase() === label.name.toLowerCase(),
    ),
);
const missingTopics = [
  'zibll',
  'wordpress',
  'fumadocs',
  'model-context-protocol',
].filter((topic) => !verifiedTopics.names.includes(topic));

if (
  !verifiedRepository.has_issues ||
  !verifiedRepository.has_discussions ||
  verifiedRepository.has_wiki ||
  verifiedRepository.has_projects ||
  missingLabels.length ||
  missingTopics.length
) {
  throw new Error(
    `仓库配置回读失败：missingLabels=${missingLabels.map((label) => label.name).join(',') || 'none'}, missingTopics=${missingTopics.join(',') || 'none'}`,
  );
}

console.log(`[zibll-docs] GitHub community verified: ${repository}`);
console.log(`[zibll-docs] labels verified: ${labels.length}`);
console.log(
  actionsPermissions
    ? '[zibll-docs] Actions workflow permissions configured'
    : '[zibll-docs] Actions workflow permissions need manual confirmation',
);
if (pagesResult) {
  console.log('[zibll-docs] GitHub Pages build type: workflow');
} else {
  console.log(
    '[zibll-docs] Pages 暂未启用；先推送 main，再重新运行 npm run github:setup。',
  );
}
if (branchProtection) {
  console.log(
    `[zibll-docs] protected branch: ${protectedBranch} (Validate and build)`,
  );
} else {
  console.log(
    `[zibll-docs] 分支保护暂未配置；确认 ${protectedBranch} 已推送且当前账号拥有管理权限后重试。`,
  );
}
if (feedbackEndpoint && feedbackVariable) {
  console.log('[zibll-docs] Actions variable FEEDBACK_ENDPOINT configured');
}
console.log(
  '[zibll-docs] 仍需完成 GitHub App 注册、Discussion 分类，以及 Worker/NPM 所需的 Actions secrets。',
);
