---
name: 'zibll-wp-ai-dev'
description: 'Use when the user asks about WordPress AI Client, Abilities API, AI provider plugins, Connector approval, AI plugin logs/settings, Zibll AI SEO abilities, or building AI features for a Zibll site.'
---

# WordPress AI Dev

Use the bundled `zibll-wp-ai-dev` MCP server as the primary documentation source for WordPress AI Client and 子比主题 AI development.

## When To Use

- The task mentions WordPress AI Client, `wp_ai_client_prompt()`, Abilities API, `wp_register_ability()`, Provider, Connector, OpenAI, Anthropic, AI plugin, AI SEO, function calling, model tools, or automation boundaries.
- The user wants to add AI features to a Zibll site, such as SEO description generation, summaries, keyword suggestions, alt text, or content checks.
- The user provides only Zibll theme source, a child theme, or a custom plugin and asks for an AI implementation.

## Source Order

1. Use MCP tools from `zibll-wp-ai-dev` first.
2. Start with `/docs/wp-ai`.
3. For Zibll theme built-in AI behavior, also read `/docs/api/theme-ai-abilities`.
4. For placement in a real project, search theme docs for `inc/functions/ai`, post meta, Ajax, Hooks, SEO fields, Codestar, and admin UI.
5. Use `read_docs_bundle` when the task touches Ability registration, AI Client calls, Provider setup, permissions, and UI flow together.

## Important Reality Check

Most users will only provide `wp-content/themes/zibll`, a child theme, or custom plugin files. Do not stop and ask for full WordPress site source, full `wp-includes`, full `wp-content/plugins/ai`, provider plugin source, database dumps, server configs, or API keys.

Use the docs for the underlying WordPress AI rules. Use the user's Zibll source for theme fields, hooks, Ajax actions, meta keys, and extension placement. Ask only for concrete runtime facts when necessary, such as WordPress version, whether the AI plugin is enabled, whether a provider is connected, and which field should store the result.

## Working Rules

- Start with read-only or generate-only abilities. Add save/apply abilities only after user confirmation flow is clear.
- Never trust the model for permission decisions. Use WordPress capability checks, nonce checks, schema validation, sanitization, and escaping.
- Do not put destructive, payment, points, membership, order, publish, delete, or notification actions into automatic model tool lists.
- Keep API keys out of frontend code, screenshots, logs, and generated docs.
- Prefer an independent plugin for new AI functionality; use child-theme code only for small UI hooks or display changes.

## Useful Starting Queries

- `WordPress AI quick start`
- `only theme source`
- `Abilities API`
- `AI Client calling`
- `ability calling`
- `Provider Connector`
- `theme AI abilities`
