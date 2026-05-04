import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ElbaClient, UpsertAgentInput } from '../elba-client.js';
import { ElbaAuthError } from '../elba-client.js';

export async function handleUpsertAgent(
  client: ElbaClient,
  input: UpsertAgentInput,
): Promise<CallToolResult> {
  try {
    const result = await client.upsertAgent(input);
    const action = result.created ? 'Created' : 'Updated';
    return {
      content: [
        {
          type: 'text' as const,
          text: `${action} agent "${result.name}" (ID: ${result.id}, status: ${result.status})`,
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
          text: `Failed to upsert agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}

export function registerUpsertAgentTool(
  server: McpServer,
  client: ElbaClient,
): void {
  server.tool(
    'upsert_agent',
    'Create or update a voice AI agent. If an agent with the given name exists, it will be updated. Otherwise, a new agent is created with sane defaults.',
    {
      name: z.string().describe('Agent name (used for upsert matching)'),
      system_prompt: z
        .string()
        .describe("System prompt defining the agent's behavior"),
      voice: z
        .string()
        .optional()
        .describe('Voice ID from list_voices (e.g., "alloy", "coral"). If omitted on create, defaults to "alloy". If omitted on update, preserves current voice.'),
      agent_id: z
        .string()
        .optional()
        .describe('Explicit agent ID to update directly. If provided, skips name-based matching. Use list_agents to find agent IDs.'),
    },
    async ({ name, system_prompt, voice, agent_id }) => {
      return handleUpsertAgent(client, {
        name,
        systemPrompt: system_prompt,
        voice,
        agentId: agent_id,
      });
    },
  );
}
