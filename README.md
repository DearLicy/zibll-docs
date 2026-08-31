# 子比主题开发文档

面向 WordPress / 子比主题开发者的中文社区文档站，基于 [Fumadocs](https://fumadocs.dev/) + MDX 构建。页面内容和搜索索引在构建期生成，主站默认发布到 [GitHub Pages](https://pages.github.com/)，也可以交给对象存储、CDN 或 Nginx 托管。

项目的信息架构参考了 [new-api-docs-v1](https://github.com/QuantumNous/new-api-docs-v1)：顶部分类对应独立资料域，侧栏由每个分类自己的 `meta.json` 管理，文档页提供 Markdown、GitHub 和多语言入口，社区通过 Issue、Discussion 和 Pull Request 持续维护。

## 项目定位

- 内容覆盖子主题、插件、Hook、Ajax、模板、Codestar Framework、用户、论坛、商城、Zibpay、MCP 和 WordPress AI 开发。
- Pages 页面不包含登录、后台、数据库、在线 AI 对话、在线部署或远程 MCP 服务。
- 文档反馈需要时调用独立的 GitHub App Bot；Bot 不属于 Pages 页面，也不把私钥打进前端。
- 搜索索引、`llms.txt`、单页 Markdown、MCP 资源清单、站点地图和 Codex 插件市场清单都在构建期生成。
- 友情链接申请通过 GitHub Issue Form 提交，由 Actions 做格式校验并生成待审核 Pull Request，不会自动绕过人工审核。

## 目录结构

```text
content/docs/                 文档 MDX、分类元数据和侧栏顺序
data/friends.json             已审核的友情链接
packages/zibll-docs-mcp/      独立的本地 stdio MCP npm 包
plugins/                      Codex 插件和 Skill
workers/                      无状态 GitHub App feedback Bot
.github/                      Pages、质量检查、Issue/Discussion 模板
scripts/                      构建索引、MCP 数据和社区配置检查
```

`主题插件子主题/` 是本地源码参考目录，默认不会进入 Git 或静态发布物。MCP 只有在用户主动挂载该目录时才读取其中的源码，并且始终只读。

## 本地开发

```bash
npm ci
npm run dev
```

生产构建会先运行 `prebuild`，然后生成静态站点：

```bash
npm run build
```

构建结果在 `out/`。需要预览构建结果时只启动一个 3000 端口：

```bash
npm start
```

本地预览地址是 `http://127.0.0.1:3000`。`out/` 每次构建前会清理，删除的页面不会从旧构建物中继续可访问。导航交互测试默认连接这个端口：

```bash
npm run test:navigation
```

## MCP

MCP 是独立的本地 npm 包，由 Codex、Claude Code、Cursor 或其他客户端按需启动；未使用时不会占用 Pages 或网站服务器资源。

公开包发布后直接运行：

```bash
npx -y zibll-docs-mcp
```

在当前源码仓库中开发或测试时，先生成随包数据：

```bash
npm run mcp:prepare
node packages/zibll-docs-mcp/bin/zibll-docs-mcp.mjs
```

需要读取用户主动指定的源码目录时：

```bash
node packages/zibll-docs-mcp/bin/zibll-docs-mcp.mjs \
  --source-dir /path/to/主题插件子主题
```

可用工具包括 `list_docs`、`read_doc`、`search_docs`、`read_docs_bundle`、`doc_outline`、`find_code_examples`、`list_source_files` 和 `read_source_file`。后两个工具只读挂载目录，限制路径穿越、敏感文件和单文件大小。

Codex 配置：

```toml
[mcp_servers.zibll-docs]
command = "npx"
args = ["-y", "zibll-docs-mcp"]
```

详见 [`/docs/mcp`](/docs/mcp) 和 [`packages/zibll-docs-mcp/README.md`](packages/zibll-docs-mcp/README.md)。

## Codex 插件

插件市场清单位于 `.agents/plugins/marketplace.json`，插件源码位于 `plugins/`。仓库被迁移到组织后，只需要同步更新 `lib/project-config.ts`、插件主页和市场源地址。

```bash
codex plugin marketplace add https://github.com/DearLicy/zibll-docs.git
codex plugin add zibll-docs@zibll-docs
```

## GitHub Pages

`.github/workflows/pages.yml` 使用 GitHub 官方 Pages artifact 流程：

1. `actions/configure-pages` 计算项目路径和公共 origin。
2. Fumadocs 和 Next.js 导出 `out/`。
3. `actions/upload-pages-artifact` 上传静态文件。
4. `actions/deploy-pages` 发布到 Pages。

工作流会注入：

- `NEXT_PUBLIC_BASE_PATH`：仓库 Pages 的项目路径。
- `NEXT_PUBLIC_SITE_URL`：实际 Pages 公共地址，用于 canonical、sitemap、MCP 清单和 Markdown 来源链接。
- `NEXT_PUBLIC_FEEDBACK_ENDPOINT`：可选的外部 Bot `/feedback` 地址。

没有自有域名也可以使用项目地址：`https://<账号>.github.io/<仓库名>/`。不要把 `localhost` 或构建机地址写进文档、canonical、sitemap 或 MCP 数据。

## GitHub 社区

社区入口和职责：

- 文档页底部反馈：提交给外部 GitHub App Bot，由 Bot 创建带页面上下文的 Issue。
- Issue Form：报告可复现问题、文档错误、功能建议或申请友情链接。
- Discussions：讨论架构、源码研究、案例和长期方案。
- Pull Request：提交 MDX、组件、测试、MCP 或工作流修改。

首次推送 `main` 后，先授权 GitHub CLI 并运行幂等初始化：

```bash
gh auth login --hostname github.com --web --scopes repo,workflow
npm run github:setup
```

脚本会配置并回读验证仓库描述、主页、Topics、Issues、Discussions、合并策略、Actions 权限、标签、Pages 构建来源和 `main` 分支质量门禁。GitHub API 暂时不可用的可选项会明确输出为待处理，不会伪造成功。

仍需由维护者完成的安全授权：

1. 创建只安装到本仓库的 GitHub App，并授予 `Issues: Read and write`、`Metadata: Read-only`。
2. 将 Cloudflare API 凭据和 GitHub App 三项凭据写入 Actions secrets，再手动运行 `Deploy feedback GitHub App Worker`。
3. Worker 发布后执行 `npm run github:setup -- --feedback-endpoint https://<worker>.workers.dev/feedback`，写入 `FEEDBACK_ENDPOINT` Actions Variable。
4. 按需要调整 GitHub 自动创建的 Discussion 分类；分类设置目前不能由仓库文件完整声明。
5. 配置 `NPM_TOKEN` 后，用 `mcp-v<版本>` 标签触发 MCP 包发布工作流。

反馈 Bot、Pages 和 MCP 的职责彼此独立：Pages 承载高并发静态访问，Worker 只在提交反馈时运行，MCP 只在本地 AI 客户端请求时启动。

## 静态资源入口

- `/llms.txt`：文档目录索引。
- `/llms-full.txt`：构建期生成的全文 Markdown。
- `/mcp/manifest.json`：本地 MCP 包和资源说明，不是在线 MCP 端点。
- `/mcp/resources.json`：静态文档资源列表。
- `/marketplace.json`：Codex 插件市场清单副本。
- `/sitemap.xml`、`/robots.txt`：搜索引擎入口。

Fumadocs 的 `/api/search` 是构建期导出的静态 Orama 数据，不需要常驻 API 进程。

## 检查命令

```bash
npm run format:check
npx tsc --noEmit
npm run mcp:check
npm run community:check
npm run pages:check
npm pack --workspace packages/zibll-docs-mcp --dry-run
npm run build
npm run test:navigation
```

项目公告见 [zibll.top/forum-post/51202.html](https://www.zibll.top/forum-post/51202.html)，完整社区规则见 [`/docs/community`](/docs/community)。

## 许可证

原创文档与构建期文档数据使用 [CC0 1.0](LICENSE)，项目代码使用 MIT。子比主题、子主题、插件等本地参考源码不会进入仓库，也不在本项目许可证范围内；产品名称、商标和 Logo 权利归各自所有者。
