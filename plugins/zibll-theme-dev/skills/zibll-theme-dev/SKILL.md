---
name: 'zibll-theme-dev'
description: 'Use when the user asks for Zibll/子比主题 plugin development, child theme development, hooks, filters, Ajax actions, meta fields, Codestar Framework settings, template overrides, shortcodes, widgets, or theme API integration.'
---

# Zibll Theme Dev

Use the bundled `zibll-theme-dev` MCP server as the primary documentation source for 子比主题二次开发 tasks.

## When To Use

- The task mentions 子比主题, Zibll, 子主题, 插件开发, Codestar Framework, Hook, Filter, Ajax, Meta, shortcode, widget, template override, user center, shop, BBS, SEO, media upload, messages, or theme functions.
- The user wants code that extends a Zibll site without editing theme core files.
- The user provides theme, child-theme, or custom-plugin source and asks where to place new functionality.

## Source Order

1. Use MCP tools from `zibll-theme-dev` first.
2. Start with `search_docs` for the exact feature or function name.
3. Prefer these documentation areas when relevant:
   - `/docs/api`
   - `/docs/guide/plugin-making`
   - `/docs/guide/subtheme-making`
   - `/docs/codestar-framework`
   - `/docs/source-structure`
4. Use `read_doc` for known pages and `read_docs_bundle` for related implementation areas.
5. Use `find_code_examples` for hooks, Ajax actions, configuration arrays, fields, PHP snippets, and template examples.

## Working Rules

- Prefer independent plugins, child themes, hooks, filters, shortcodes, and documented extension points over editing `wp-content/themes/zibll` core files.
- Inspect the user's actual files after reading the relevant docs.
- Keep code compatible with the surrounding WordPress and Zibll PHP style.
- Preserve existing theme update safety: do not tell users to patch theme core unless they explicitly accept the maintenance cost.
- Recheck nonce, capability, sanitization, escaping, and data ownership for Ajax, upload, payment, user, and admin actions.

## Useful Starting Queries

- `plugin making`
- `subtheme making`
- `Codestar custom fields`
- `Ajax actions`
- `post meta`
- `template override`
- `media upload`
- `Zibpay paid download`
