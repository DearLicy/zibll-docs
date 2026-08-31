# GitHub feedback bot

Pages 页面负责高速静态访问，文档反馈需要写入 GitHub 时由这里的无状态 Cloudflare Worker 处理。它是独立的动态适配层，不是文档站的运行时后端，也不要求 Pages、MCP 或普通访问请求常驻服务。

## 请求链路

1. 用户在文档页选择“有帮助”或“没帮助”并填写说明。
2. 浏览器把当前页面、评价和说明发送到 Worker 的 `/feedback`。
3. Worker 校验浏览器 Origin、Pages 页面范围、JSON 大小和文本长度。
4. Worker 使用 GitHub App 的短期 installation token 创建带页面上下文的 Issue。
5. 只有 GitHub 返回有效 Issue URL 后，前端才显示“在 GitHub 查看”。

Worker 不保存反馈、用户资料或对话，也不会把 GitHub App 私钥发送到 Pages。没有自有域名时直接使用 Cloudflare 提供的 `workers.dev` 地址即可。

## 创建 GitHub App

在目标 GitHub 账号或组织创建一个 GitHub App：

- Homepage URL：`https://dearlicy.github.io/zibll-docs`
- Webhook：关闭
- Repository permissions：`Issues: Read and write`、`Metadata: Read-only`
- 只安装到 `DearLicy/zibll-docs`，不要授予不相关仓库
- 生成并下载 RSA private key

记录 App ID，并从 App 的安装页面获取 Installation ID。私钥只作为 Worker secret 保存。

## 通过 GitHub Actions 部署

仓库提供 `.github/workflows/deploy-feedback-worker.yml`，只允许维护者手动触发。先在仓库 Actions secrets 中配置：

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_APP_INSTALLATION_ID
```

Cloudflare token 只授予目标账号的 Workers Scripts 编辑权限。GitHub App 私钥应保留完整 PEM 换行，并只写入 secret；不要粘贴到 Issue、日志、仓库变量或前端环境变量。

在 Actions 页面运行 **Deploy feedback GitHub App Worker**。工作流会先检查 Worker 语法，再把三项 GitHub App 凭据作为 Worker secrets 上传并执行部署。未配置任一 secret 时工作流会失败，不会生成假地址。

## 从本地部署

需要调试 Worker 时，也可以使用 Wrangler：

```bash
cd workers
npx wrangler login
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_APP_PRIVATE_KEY
npx wrangler secret put GITHUB_APP_INSTALLATION_ID
npx wrangler deploy
```

部署完成后地址类似：

```text
https://zibll-docs-feedback.<your-workers-subdomain>.workers.dev/feedback
```

`wrangler.toml` 中的仓库、Pages 地址和允许来源按默认仓库填写。若仓库迁移到组织或 Pages 地址改变，同时修改 `GITHUB_REPOSITORY_OWNER`、`GITHUB_REPOSITORY_NAME`、`PUBLIC_SITE_URL` 和 `ALLOWED_ORIGINS`。`ALLOWED_ORIGINS` 只写 origin，不要带项目路径。

## 连接 Pages

部署成功后，在仓库根目录通过已授权的 GitHub CLI 写入 Actions Variable：

```bash
npm run github:setup -- \
  --feedback-endpoint https://zibll-docs-feedback.<your-workers-subdomain>.workers.dev/feedback
```

Pages 工作流下次构建时会把它注入为 `NEXT_PUBLIC_FEEDBACK_ENDPOINT`。这个地址可以公开；GitHub App ID、Installation ID 和 private key 不可以放进仓库变量或前端代码。

本地构建没有配置该变量时，文档反馈会明确显示“GitHub Bot 尚未配置”，不会退回到手动 `issues/new`。这样测试环境不会误创建公开 Issue。

## 验证与排错

```bash
curl -i https://zibll-docs-feedback.<your-workers-subdomain>.workers.dev/health
```

正常响应应包含 `ok: true`。提交反馈失败时按顺序检查：

1. 浏览器 `Origin` 是否与 `ALLOWED_ORIGINS` 完全匹配。
2. `PUBLIC_SITE_URL` 是否包含当前 Pages 项目路径。
3. GitHub App 是否安装到目标仓库，且拥有 Issues 写权限。
4. 三个 Worker secret 是否存在，private key 是否为完整 PEM。
5. Worker 日志中的 GitHub 状态码；不要记录或粘贴私钥、token 和完整请求正文。

## 可选标签

如果仓库存在 `documentation` 标签，Bot 会尝试给 Issue 加上该标签。标签不存在时会自动无标签重试；也可以把 `GITHUB_ISSUE_LABELS` 设为空。

## 安全边界

- 只接受 `ALLOWED_ORIGINS` 中的浏览器来源。
- 只接受 `PUBLIC_SITE_URL` 下的页面地址。
- 请求体、标题和反馈内容都有大小上限。
- Worker 不记录请求正文、不保存长期业务数据；installation token 只在 Worker isolate 内短暂缓存。
- GitHub App 只需要目标仓库的 Issue 和 Metadata 权限。
