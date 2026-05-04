import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getConfig } from './config.js';
import { ElbaClient } from './elba-client.js';
import { registerListAgentsTool } from './tools/list-agents.js';
import { registerListVoicesTool } from './tools/list-voices.js';
import { registerUpsertAgentTool } from './tools/upsert-agent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));

export async function startServer(): Promise<void> {
  const config = getConfig();

  const client = new ElbaClient({
    baseUrl: config.apiBaseUrl,
    token: config.token,
  });

  const server = new McpServer({
    name: 'elba-mcp-server',
    version: pkg.version as string,
  });

  registerListAgentsTool(server, client);
  registerListVoicesTool(server, client);
  registerUpsertAgentTool(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
