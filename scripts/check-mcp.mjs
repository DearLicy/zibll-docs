#!/usr/bin/env node

import assert from 'node:assert/strict';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = process.cwd();
const command = process.execPath;
const server = path.join(
  root,
  'packages/zibll-docs-mcp/bin/zibll-docs-mcp.mjs',
);
const transport = new StdioClientTransport({
  command,
  args: [server],
  cwd: root,
  stderr: 'pipe',
});
const client = new Client({ name: 'zibll-docs-check', version: '0.1.0' });

await client.connect(transport);
const tools = await client.listTools();
const names = new Set(tools.tools.map((tool) => tool.name));
for (const name of [
  'list_docs',
  'read_doc',
  'search_docs',
  'read_docs_bundle',
  'doc_outline',
  'find_code_examples',
  'list_source_files',
  'read_source_file',
]) {
  assert(names.has(name), `missing MCP tool: ${name}`);
}

const search = await client.callTool({
  name: 'search_docs',
  arguments: { query: 'Codestar', limit: 2 },
});
const searchText = JSON.stringify(search);
assert.match(searchText, /Codestar|codestar/);

const page = await client.callTool({
  name: 'read_doc',
  arguments: { slug: 'codestar-framework' },
});
assert.match(JSON.stringify(page), /Codestar Framework/);

await client.close();
console.log(`[zibll-docs] MCP check passed (${names.size} tools)`);
