---
name: 'zibll-docs'
description: 'Use when the user asks about Zibll/子比主题 development, WordPress child themes, Zibll plugins, Codestar Framework settings, theme APIs, Zibpay paid downloads, migration, or site integration tasks that should be grounded in the Zibll development docs.'
---

# Zibll Docs

Use the bundled `zibll-docs` MCP server as the primary documentation source for 子比主题 development work.

## When To Use

- The task mentions 子比主题, Zibll, Zibpay, Codestar Framework, WordPress child themes, theme plugins, hooks, meta fields, user systems, shop, BBS, SMS, SEO, Baidu submission, migration, or site integration for a Zibll site.
- The user asks for code examples, configuration examples, API usage, or troubleshooting based on this documentation site.
- You need to verify an implementation choice against the current docs before editing a WordPress theme, plugin, or migration script.

## Source Order

1. Use MCP tools from `zibll-docs` first.
2. Start with `search_docs` for topic discovery.
3. Use `read_doc` when a specific slug is known.
4. Use `read_docs_bundle` when a task needs several related pages loaded together.
5. Use `doc_outline` before reading a long page if only one section is relevant.
6. Use `find_code_examples` when the user asks for sample code, function calls, config arrays, hooks, or short snippets.
7. If MCP is unavailable, fall back to `https://dearlicy.github.io/zibll-docs/llms.txt`, `https://dearlicy.github.io/zibll-docs/llms-full.txt`, or the static single-page Markdown files under `https://dearlicy.github.io/zibll-docs/docs/{slug}.mdx`.

## Working Rules

- Do not rely on memory or general WordPress assumptions when the docs can answer the question.
- For implementation work, inspect the user's actual project files after reading the relevant docs.
- Prefer child themes, plugin code, hooks, filters, and documented extension points over editing theme core files.
- Keep generated code compatible with the surrounding WordPress/PHP style unless the user asks for a new structure.
- When docs and local runtime behavior conflict, treat runtime behavior as decisive and use the docs to explain likely intent.

## Useful Starting Queries

- `Codestar Framework custom fields`
- `Zibpay paid download`
- `plugin making`
- `subtheme making`
- `user growth permissions`
- `single post rendering`
- `migration media Zibpay`
