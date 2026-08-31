import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve('.');

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function readJson(path) {
  return JSON.parse(read(path));
}

function fail(message) {
  throw new Error(`[zibll-docs] community check failed: ${message}`);
}

function requireText(path, values) {
  const content = read(path);
  for (const value of values) {
    if (!content.includes(value)) fail(`${path} is missing ${value}`);
  }
  return content;
}

const requiredFiles = [
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/ISSUE_TEMPLATE/bug.yml',
  '.github/ISSUE_TEMPLATE/docs.yml',
  '.github/ISSUE_TEMPLATE/feature.yml',
  '.github/ISSUE_TEMPLATE/friend-link.yml',
  '.github/ISSUE_TEMPLATE/question.yml',
  '.github/DISCUSSION_TEMPLATE/ideas.yml',
  '.github/DISCUSSION_TEMPLATE/q-and-a.yml',
  '.github/DISCUSSION_TEMPLATE/showcase.yml',
  '.github/DISCUSSION_TEMPLATE/source-research.yml',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/CODEOWNERS',
  '.github/FUNDING.yml',
  '.github/dependabot.yml',
  '.github/labeler.yml',
  '.github/labels.json',
  '.github/release.yml',
  '.github/workflows/deploy-feedback-worker.yml',
  '.github/workflows/friend-link-bot.yml',
  '.github/workflows/pages.yml',
  '.github/workflows/publish-mcp.yml',
  '.github/workflows/pull-request-labeler.yml',
  '.github/workflows/quality.yml',
  '.github/workflows/sync-labels.yml',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'GOVERNANCE.md',
  'LICENSE',
  'SECURITY.md',
  'SUPPORT.md',
  'content/docs/community/github-community.mdx',
  'content/docs/community/governance.mdx',
  'data/friends.json',
  'scripts/setup-github.mjs',
  'scripts/check-pages-export.mjs',
  'workers/README.md',
  'workers/feedback-bot.mjs',
];

for (const path of requiredFiles) {
  if (!existsSync(resolve(root, path))) fail(`missing ${path}`);
}

const issueConfig = read('.github/ISSUE_TEMPLATE/config.yml');
if (!issueConfig.includes('blank_issues_enabled: false')) {
  fail('blank Issue submission must be disabled');
}

const templateFiles = [
  '.github/ISSUE_TEMPLATE/bug.yml',
  '.github/ISSUE_TEMPLATE/docs.yml',
  '.github/ISSUE_TEMPLATE/feature.yml',
  '.github/ISSUE_TEMPLATE/friend-link.yml',
  '.github/ISSUE_TEMPLATE/question.yml',
  '.github/DISCUSSION_TEMPLATE/ideas.yml',
  '.github/DISCUSSION_TEMPLATE/q-and-a.yml',
  '.github/DISCUSSION_TEMPLATE/showcase.yml',
  '.github/DISCUSSION_TEMPLATE/source-research.yml',
];

for (const path of templateFiles) {
  requireText(path, ['name:', 'description:', 'body:']);
}

const meta = readJson('content/docs/meta.json');
if (meta.pages.includes('installation')) {
  fail('removed installation category is still in content/docs/meta.json');
}

const communityMeta = readJson('content/docs/community/meta.json');
for (const page of [
  'github-community',
  'governance',
  'feedback',
  'friend-links',
]) {
  if (!communityMeta.pages.includes(page)) {
    fail(`community sidebar is missing ${page}`);
  }
}

const forbiddenPaths = [
  '.htaccess',
  '.well-known',
  'app/api/ai',
  'app/api/auth',
  'app/api/deploy',
  'app/api/site',
  'components/ai',
  'content/docs/installation',
  'lib/deploy-queue.ts',
  'plugins/zibll-deploy-helper',
];
for (const path of forbiddenPaths) {
  if (existsSync(resolve(root, path))) fail(`removed path exists: ${path}`);
}

requireText('.github/CODEOWNERS', ['@DearLicy']);
requireText('.github/dependabot.yml', [
  'package-ecosystem: npm',
  'package-ecosystem: github-actions',
]);
requireText('.github/workflows/pages.yml', [
  'actions/configure-pages@v5',
  'NEXT_PUBLIC_BASE_PATH',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_FEEDBACK_ENDPOINT',
  'actions/upload-pages-artifact@v3',
  'npm run pages:check',
  'out',
]);
requireText('.github/workflows/quality.yml', [
  'push:',
  'branches: [main]',
  'name: Validate and build',
  'npm run mcp:prepare',
  'npm run mcp:check',
  'npm pack --workspace packages/zibll-docs-mcp --dry-run',
  'npm run community:check',
  'npm run build',
  'npm run pages:check',
  'npm run test:navigation',
]);
requireText('.github/workflows/publish-mcp.yml', [
  "'mcp-v*'",
  'npm run mcp:check',
  'npm publish --workspace packages/zibll-docs-mcp',
  'NPM_TOKEN',
]);
requireText('.github/workflows/deploy-feedback-worker.yml', [
  'workflow_dispatch:',
  'cloudflare/wrangler-action@v3',
  'CLOUDFLARE_API_TOKEN',
  'GITHUB_APP_ID',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_INSTALLATION_ID',
]);

const friendWorkflow = requireText('.github/workflows/friend-link-bot.yml', [
  'types: [opened, edited, reopened, labeled]',
  "value('Logo 地址')",
  'friends.push(publicEntry)',
  'Closes #${{ github.event.issue.number }}',
]);
if (friendWorkflow.includes('friends.push(request)')) {
  fail('friend-link workflow writes private review fields to public data');
}

requireText('scripts/setup-github.mjs', [
  'has_issues: true',
  'has_discussions: true',
  'delete_branch_on_merge: true',
  '/actions/permissions/workflow',
  '/actions/variables/FEEDBACK_ENDPOINT',
  '/protection',
  "contexts: ['Validate and build']",
  'GitHub community verified',
]);

const labels = readJson('.github/labels.json');
const labelNames = new Set();
for (const label of labels) {
  if (
    typeof label.name !== 'string' ||
    !/^[0-9a-f]{6}$/i.test(label.color) ||
    typeof label.description !== 'string'
  ) {
    fail('invalid entry in .github/labels.json');
  }
  const name = label.name.toLowerCase();
  if (labelNames.has(name)) fail(`duplicate label: ${label.name}`);
  labelNames.add(name);
}
for (const name of [
  'documentation',
  'community',
  'friend-link',
  'automated-pr',
  'mcp',
  'codex-plugin',
  'workers',
  'github-actions',
]) {
  if (!labelNames.has(name)) fail(`missing repository label: ${name}`);
}

const friends = readJson('data/friends.json');
if (!Array.isArray(friends) || friends.length === 0) {
  fail('data/friends.json must contain at least one link');
}
const friendUrls = new Set();
for (const friend of friends) {
  for (const field of ['name', 'url', 'description']) {
    if (typeof friend[field] !== 'string' || !friend[field].trim()) {
      fail(`friend entry is missing ${field}`);
    }
  }
  if ('email' in friend || 'backlink' in friend) {
    fail('friend data must not persist email or backlink review fields');
  }
  if (friend.logo !== undefined && typeof friend.logo !== 'string') {
    fail('friend logo must be a string when provided');
  }
  if (typeof friend.featured !== 'boolean') {
    fail('friend featured flag must be boolean');
  }
  const url = new URL(friend.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    fail(`friend URL must use http(s): ${friend.url}`);
  }
  const normalizedUrl = friend.url.toLowerCase().replace(/\/+$/, '');
  if (friendUrls.has(normalizedUrl))
    fail(`duplicate friend URL: ${friend.url}`);
  friendUrls.add(normalizedUrl);
}

const mcpPackage = readJson('packages/zibll-docs-mcp/package.json');
if (
  mcpPackage.name !== 'zibll-docs-mcp' ||
  mcpPackage.license !== 'MIT AND CC0-1.0' ||
  !mcpPackage.repository?.url ||
  !mcpPackage.homepage ||
  mcpPackage.scripts?.prepack !== 'node ../../scripts/generate-mcp-data.mjs'
) {
  fail('MCP package metadata or prepack data generation is incomplete');
}

requireText('content/docs/mcp/index.mdx', [
  '八个只读工具',
  '`list_docs`',
  '`read_doc`',
  '`search_docs`',
  '`read_docs_bundle`',
  '`doc_outline`',
  '`find_code_examples`',
  '`list_source_files`',
  '`read_source_file`',
]);

const generatedMcpData = resolve(
  root,
  'packages/zibll-docs-mcp/data/docs.json',
);
if (existsSync(generatedMcpData)) {
  const content = readFileSync(generatedMcpData, 'utf8');
  if (content.includes('/docs/installation')) {
    fail('generated MCP data still contains a removed installation route');
  }
}

for (const path of [
  'out/docs/installation',
  'out/en/docs/installation',
  'out/ja/docs/installation',
]) {
  if (existsSync(resolve(root, path))) {
    fail(`generated output still contains a removed route: ${path}`);
  }
}

const sourceFiles = [
  'app',
  'components',
  'content/docs',
  'lib',
  '.github',
].flatMap((directory) => {
  const output = [];
  const walk = (current) => {
    if (!existsSync(current)) return;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(?:md|mdx|ts|tsx|mjs|yml|yaml|json)$/.test(path)) {
        output.push(path);
      }
    }
  };
  walk(resolve(root, directory));
  return output;
});

for (const path of sourceFiles) {
  const content = readFileSync(path, 'utf8');
  if (content.includes('/docs/installation')) {
    fail(`stale installation link in ${relative(root, path)}`);
  }
}

console.log('[zibll-docs] community check passed');
