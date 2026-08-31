import { expect, test, type Page } from '@playwright/test';

const topNavigation = [
  ['/docs', '使用指南'],
  ['/docs/codestar-framework', 'Codestar Framework'],
  ['/docs/api', '主题扩展'],
  ['/docs/wp-ai', 'WP AI'],
  ['/docs/ai', '开发工具'],
  ['/docs/community', '社区协作'],
  ['/docs/sponsor', '赞助打赏'],
] as const;

async function expectCompleteTopNavigation(page: Page) {
  for (const [href, title] of topNavigation) {
    const link = page
      .locator(
        `a[class*="border-b-2"][href="${href}"], a[class*="border-b-2"][href="${href}/"]`,
      )
      .filter({ visible: true })
      .first();
    await expect(link, `顶部分类缺失：${title}`).toBeVisible();
    await expect(link).toContainText(title);
  }
}

test('direct docs entry renders the complete static navigation', async ({
  page,
}) => {
  const response = await page.goto('/docs', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expectCompleteTopNavigation(page);
  await expect(page.getByText('推荐插件', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '打开', exact: true }).click();
  await expect(page.getByRole('link', { name: '提交反馈' })).toHaveAttribute(
    'href',
    '#doc-feedback',
  );
  await expect(
    page.locator('a[href*="issues/new"]').filter({ visible: true }),
  ).toHaveCount(0);
  await expect(page.locator('a[href*="/api/auth/"]')).toHaveCount(0);
  await expect(
    page.getByText('这篇文档对您有帮助吗？', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('#nd-docs-layout footer')).toBeVisible();
});

test('docs navigation never calls removed runtime APIs', async ({ page }) => {
  const removedRequests: string[] = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (
      /\/api\/(?:ai|auth|deploy|plugins|site|sponsor)(?:\/|$)/.test(pathname)
    ) {
      removedRequests.push(pathname);
    }
  });

  for (const path of [
    '/docs',
    '/docs/codestar-framework',
    '/docs/ai',
    '/docs/community',
  ]) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expectCompleteTopNavigation(page);
  }

  expect(removedRequests).toEqual([]);
});

test('categories keep their own routes and the developer tools sidebar', async ({
  page,
}) => {
  await page.goto('/docs', { waitUntil: 'networkidle' });
  await page
    .locator(
      'a[class*="border-b-2"][href="/docs/codestar-framework"], a[class*="border-b-2"][href="/docs/codestar-framework/"]',
    )
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/codestar-framework\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Codestar Framework',
  );
  await expectCompleteTopNavigation(page);

  await page
    .locator(
      'a[class*="border-b-2"][href="/docs/ai"], a[class*="border-b-2"][href="/docs/ai/"]',
    )
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/ai\/?$/);
  await expectCompleteTopNavigation(page);
  await expect(
    page
      .locator(
        'a[href="/docs/ai/codex-plugin"], a[href="/docs/ai/codex-plugin/"]',
      )
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await expect(page.getByText('推荐插件', { exact: true })).toHaveCount(0);
});

test('homepage category menu keeps valid document routes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const menuTrigger = page
    .locator('header button')
    .filter({ hasText: '文档' })
    .first();
  await expect(menuTrigger).toBeVisible();
  await menuTrigger.hover();
  await expect(page.locator('a[href="/docs/ai/"]')).toBeVisible();

  const hrefs = await page
    .locator('a[href^="/docs"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') || ''),
    );
  for (const href of [
    '/docs/',
    '/docs/codestar-framework/',
    '/docs/api/',
    '/docs/wp-ai/',
    '/docs/ai/',
    '/docs/community/',
    '/docs/sponsor/',
  ]) {
    expect(hrefs, `首页菜单缺少 ${href}`).toContain(href);
  }
  expect(hrefs.some((href) => /^\/docs[^/]/.test(href))).toBe(false);
});

test('removed dynamic routes stay unavailable', async ({ request }) => {
  for (const path of [
    '/docs/plugins',
    '/docs/installation',
    '/api/auth/me',
    '/api/site',
    '/api/ai/settings',
    '/api/deploy',
    '/api/plugins',
    '/api/sponsor',
    '/mcp',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

test('document indexes are static and use the configured public origin', async ({
  request,
}) => {
  for (const path of [
    '/llms.txt',
    '/llms-full.txt',
    '/mcp/resources.json',
    '/mcp/manifest.json',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const body = await response.text();
    expect(body, path).not.toMatch(/https?:\/\/(?:localhost|127\.0\.0\.1)/);
    expect(body, path).toContain('https://dearlicy.github.io/zibll-docs');
  }
});

test('localized static routes and page controls are available', async ({
  page,
  request,
}) => {
  for (const path of [
    '/en',
    '/ja',
    '/en/docs',
    '/ja/docs',
    '/en/docs/community',
    '/ja/docs/community',
    '/en/friends',
    '/ja/friends',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }

  await page.goto('/en/docs', { waitUntil: 'networkidle' });
  await expect(
    page
      .locator('#nd-sidebar a[href="/en"], #nd-sidebar a[href="/en/"]')
      .first(),
  ).toBeVisible();

  await page.goto('/en/docs/community', { waitUntil: 'networkidle' });
  await expect(
    page.locator('[data-card][href="/en/docs/community/feedback/"]').first(),
  ).toBeVisible();

  await page.goto('/docs', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '切换主题' }).first().click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: '切换主题' }).first().click();
  await expect(page.locator('html')).toHaveClass(/light/);

  await page.getByRole('button', { name: '有帮助' }).click();
  await expect(
    page.getByPlaceholder('请留下您的反馈，帮助我们继续完善文档。'),
  ).toBeVisible();
});

test('friend links page is static and exposes the application form', async ({
  page,
  request,
}) => {
  await page.goto('/friends', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '友情链接',
  );
  await expect(
    page.getByRole('heading', { level: 2, name: '申请友情链接' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '打开 GitHub 申请' }),
  ).toBeVisible();
  await expect(page.getByLabel('名称')).toHaveAttribute('maxlength', '80');
  await expect(page.getByLabel('介绍')).toHaveAttribute('maxlength', '300');
  await expect(
    page.getByText(/邮箱和回链也会公开，请只填写可公开的信息/),
  ).toBeVisible();

  const metadata = await request.get('/friends');
  const metadataHtml = await metadata.text();
  expect(metadataHtml).toContain(
    '<meta property="og:url" content="https://dearlicy.github.io/zibll-docs/friends/"',
  );
  expect(metadataHtml).not.toContain(
    '<meta property="og:url" content="https://dearlicy.github.io/zibll-docs/"',
  );

  await page.goto('/en/friends', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Friends');
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open GitHub request' }),
  ).toBeVisible();
});

test('community docs expose the static collaboration workflow', async ({
  page,
}) => {
  await page.goto('/docs/community', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '社区协作',
  );
  await expect(
    page.getByRole('link', { name: /问题反馈/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /参与共建/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /社区治理/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByText('文档页底部的反馈由独立 GitHub App Bot 接收并创建 Issue'),
  ).toBeVisible();
  await expect(page.getByText('推荐插件', { exact: true })).toHaveCount(0);
});

test('GitHub community guidance is published in the community sidebar', async ({
  page,
}) => {
  await page.goto('/docs/community', { waitUntil: 'networkidle' });
  await expect(
    page.locator(
      '#nd-sidebar a[href="/docs/community/github-community"], #nd-sidebar a[href="/docs/community/github-community/"]',
    ),
  ).toBeVisible();
  await page
    .locator(
      '#nd-sidebar a[href="/docs/community/github-community"], #nd-sidebar a[href="/docs/community/github-community/"]',
    )
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/community\/github-community\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'GitHub 社区',
  );
  await expect(
    page.getByRole('heading', { level: 2, name: '文档反馈的实际链路' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Pages 发布' }),
  ).toBeVisible();
  await expect(
    page.locator(
      '#nd-sidebar a[href="/docs/community/governance"], #nd-sidebar a[href="/docs/community/governance/"]',
    ),
  ).toBeVisible();
});
