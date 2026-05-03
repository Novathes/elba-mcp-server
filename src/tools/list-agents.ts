import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ElbaClient, Agent } from '../elba-client.js';
import { ElbaAuthError } from '../elba-client.js';

export async function handleListAgents(
  client: ElbaClient,
): Promise<CallToolResult> {
  try {
    const agents: Agent[] = await client.listAgents();

    if (agents.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No agents found in your organization. Create your first agent in the Elba Dashboard at https://app.elba.ai',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(agents, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof ElbaAuthError) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Authentication failed: Invalid or expired integration token. Generate a new token in the Elba Dashboard: Settings → Integrations',
          },
        ],
      };
    }
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Failed to list agents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}

export function registerListAgentsTool(
  server: McpServer,
  client: ElbaClient,
): void {
  server.tool(
    'list_agents',
    'List all voice AI agents in your Elba organization. Returns each agent\'s ID, name, and status (active/inactive).',
    async () => handleListAgents(client),
  );
}
