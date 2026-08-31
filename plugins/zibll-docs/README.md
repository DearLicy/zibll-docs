# 子比主题开发文档 Codex 插件

这个插件把 `https://dearlicy.github.io/zibll-docs` 的子比主题开发文档接入 Codex。

## 安装

```bash
codex plugin marketplace add https://github.com/DearLicy/zibll-docs.git && codex plugin add zibll-docs@zibll-docs
```

## 可选专业插件

添加插件市场后，可以按需安装更细的专业插件：

```bash
codex plugin add zibll-theme-dev@zibll-docs
codex plugin add zibll-wp-ai-dev@zibll-docs
codex plugin add zibll-migration-helper@zibll-docs
```

- `zibll-theme-dev`：子比主题插件、子主题、Hook、Ajax、Meta、Codestar 二开。
- `zibll-wp-ai-dev`：WordPress AI Client、Abilities API、Provider 和子比 AI 功能。
- `zibll-migration-helper`：旧站迁移、Zibpay、下载资源、媒体路径和内容整理。

## 能力

- 通过 MCP 搜索、读取和组合文档页面。
- 提供 Codex Skill，指导 Codex 优先按子比主题文档处理插件、子主题、Codestar、接口、迁移和 WordPress AI 开发任务。
- 适合在 WordPress / Zibll 二次开发项目中长期启用。
