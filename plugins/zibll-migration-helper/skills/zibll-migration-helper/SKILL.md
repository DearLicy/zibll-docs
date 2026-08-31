---
name: 'zibll-migration-helper'
description: 'Use when the user asks about migrating WordPress/Zibll content, preserving timestamps, Zibpay paid download data, media uploads, attachment paths, domain replacement, object storage/CDN migration, old shortcodes, content cleanup, or database-safe update plans.'
---

# Zibll Migration Helper

Use the bundled `zibll-migration-helper` MCP server as the primary documentation source for migration and content cleanup tasks.

## When To Use

- The task mentions migration, old WordPress content, Zibll/Zibpay paid downloads, download links, attachments, media paths, domain replacement, object storage, CDN, timestamps, SQL updates, shortcode cleanup, broken links, or content conversion.
- The user wants to preserve existing behavior, timestamps, IDs, download links, prices, permissions, or media references while changing content structure.
- The user provides exported posts, database snippets, plugin data, old shortcodes, HTML blocks, or migration scripts.

## Source Order

1. Use MCP tools from `zibll-migration-helper` first.
2. Start with docs about domain migration, object storage, media upload, Zibpay, paid downloads, and content rendering.
3. Prefer these documentation areas when relevant:
   - `/docs/guide/site-settings`
   - `/docs/api/media-upload`
   - `/docs/api/zibpay`
   - `/docs/api/zibpay-paid-download`
   - `/docs/api/single-post-rendering`
   - `/docs/api/content-audit-security`
4. Use `search_docs` for exact field names, meta keys, functions, and old shortcode names.
5. Use `find_code_examples` for SQL, PHP migration snippets, filter hooks, and content parsing examples.

## Working Rules

- Treat production content as valuable. Prefer backups, dry runs, limited batches, and reversible scripts.
- Preserve `post_date`, `post_modified`, IDs, slugs, and existing business fields unless the user explicitly wants to change them.
- For WordPress post content updates where timestamps must not change, prefer carefully scoped direct SQL updates after backup instead of APIs that update modified time.
- Do not invent download names if the user asks for link-only extraction.
- Keep original and transformed artifacts separate during parsing.
- Validate a small sample end to end before batch migration.
- Never expose or store database passwords, API keys, cookies, tokens, or private files in generated output.

## Useful Starting Queries

- `domain migration`
- `object storage CDN`
- `media upload`
- `Zibpay paid download`
- `single post rendering`
- `download resources`
- `preserve timestamps`
- `shortcode cleanup`
