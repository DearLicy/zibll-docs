# WordPress AI 开发助手

这是子比主题开发文档的 WordPress AI 专业 Codex 插件，适合 AI Client、Abilities API、Provider、Connector、AI 插件和子比主题 AI 功能二开。

## 安装

```bash
codex plugin add zibll-wp-ai-dev@zibll-docs
```

如果还没有添加本站插件市场，先运行：

```bash
codex plugin marketplace add https://github.com/DearLicy/zibll-docs.git
```

## 适合场景

- 基于子比主题源码开发 AI SEO、摘要、关键词、标题建议等功能。
- 注册 WordPress Ability 并编写输入输出 schema。
- 使用 `wp_ai_client_prompt()` 调用模型。
- 判断哪些能力可以自动读取，哪些必须人工确认。
- 用户只提供子比主题源码时，继续结合本站文档完成 AI 二开分析。
