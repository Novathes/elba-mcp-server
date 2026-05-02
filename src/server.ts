import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

export async function startServer(): Promise<void> {
  const server = new McpServer({
    name: 'elba-mcp-server',
    version: pkg.version as string,
  });

  // Tools will be registered here

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
