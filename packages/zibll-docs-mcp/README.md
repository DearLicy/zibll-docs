# zibll-docs-mcp

子比主题开发文档的本地只读 MCP 服务器。网站页面由静态 Fumadocs 承载；MCP 是独立 npm 包，不提供在线 MCP、登录、数据库或 AI 对话接口。

## 使用

```bash
npx -y zibll-docs-mcp
```

包发布前由仓库的 `prepack` 脚本从 `content/docs` 生成随包携带的文档数据。直接在源码仓库测试时运行：

```bash
npm run mcp:prepare
node packages/zibll-docs-mcp/bin/zibll-docs-mcp.mjs
```

Codex 配置：

```toml
[mcp_servers.zibll-docs]
command = "npx"
args = ["-y", "zibll-docs-mcp"]
```

## 工具

- `list_docs`
- `read_doc`
- `search_docs`
- `read_docs_bundle`
- `doc_outline`
- `find_code_examples`
- `list_source_files`
- `read_source_file`

最后两个工具只有在本地存在 `主题插件子主题` 目录，或显式传入 `--source-dir /path/to/source` 时才会读取源码。源码读取限制为只读、单文件不超过 256 KiB，并自动跳过 `.git`、`node_modules`、缓存和常见凭据文件。

MCP 进程由客户端按需启动，未使用时不会占用网站服务器内存。

## 发布

维护者修改 package version 后创建 `mcp-v<version>` 标签。GitHub Actions 会运行静态文档生成和协议检查，再使用仓库的 `NPM_TOKEN` 发布公开包。包元数据中的仓库、问题反馈和文档主页均指向 `DearLicy/zibll-docs`。
