# 参与共建

子比主题开发文档采用公开仓库协作。文档结论以可复核的主题、子主题或插件源码为依据，Issue 用来追踪问题，Discussion 用来讨论方案，Pull Request 用来合并可检查的修改。

## 从哪里开始

```bash
git clone https://github.com/DearLicy/zibll-docs.git
cd zibll-docs
npm ci
```

文档位于 `content/docs`。每个顶部分类拥有自己的 `meta.json`；新增或移动页面时，必须同步调整对应的侧栏顺序和 `lib/routes.ts` 中的顶部分类清单。不要手工编辑 `public/docs`、`public/llms*.txt`、`public/mcp` 或 `packages/zibll-docs-mcp/data/docs.json`，它们由构建脚本生成。

## 文档写作标准

每篇页面应回答一个明确问题，并尽量提供：

1. 适用场景、主题版本和前置条件。
2. 真实源码路径、函数名、Hook、Ajax action、字段名或调用顺序。
3. 最小可运行的 PHP、JavaScript 或配置示例。
4. 权限、转义、nonce、缓存、版本差异和停用边界。
5. 常见误区、复现步骤和排错顺序。

内部链接使用 `/docs/...`，不要写 `localhost`、临时端口、构建机路径或已删除的在线部署入口。涉及动态能力时，说明它属于独立 Worker、GitHub Actions 还是本地 MCP，不要把它描述成 Pages 自身提供的服务。

## Pull Request 流程

1. 先搜索文档、Issues 和 Discussions，确认不是重复内容。
2. 从 `主题插件子主题/` 或公开源码中核对结论，脱敏后再写入文档。
3. 修改正确分类的 MDX、`meta.json`、组件或脚本。
4. 运行检查并在 PR 中写明变更依据、验证命令和未覆盖风险。
5. 关联对应 Issue，等待 Pages 和质量工作流通过。

提交前建议执行：

```bash
npm run format:check
npx tsc --noEmit
npm run mcp:prepare
npm run mcp:check
npm run community:check
npm run pages:check
npm pack --workspace packages/zibll-docs-mcp --dry-run
npm run build
npm run test:navigation
```

`test:navigation` 会复用已运行的 3000 端口；没有预览进程时会自动启动 `out/` 的唯一静态预览。手动检查布局时也只使用这个端口：

```bash
npm start
npm run test:navigation
```

## MCP 包发布

`packages/zibll-docs-mcp` 是独立 npm 包。`prepack` 会从 `content/docs` 生成随包携带的 `data/docs.json`，所以发布前不需要把生成物提交到仓库。

发布步骤：

```bash
# 修改 packages/zibll-docs-mcp/package.json 的 version
git tag mcp-v0.1.1
git push origin main --tags
```

`.github/workflows/publish-mcp.yml` 会重新生成数据、运行 MCP 协议检查、检查 tarball 内容，并使用 `NPM_TOKEN` 发布。标签必须与 package version 完全一致；也可以从 Actions 页面手动运行工作流并显式选择发布。

## 运行边界

- GitHub Pages 页面必须可以静态导出，不依赖登录、数据库、Redis 或常驻 Node 进程。
- 动态写入能力（例如文档反馈）放在 `workers/` 等独立服务目录，并校验来源、输入大小和目标范围。
- MCP 和 Codex 插件默认只读、按需启动，不上传用户源码，不修改用户文件。
- 不要提交 API Key、Cookie、密码、私钥、生产日志、`.data`、`out` 或本地主题源码。
- 需要安全报告时使用 `SECURITY.md` 的私下渠道，不要在公开 Issue 中披露细节。
