import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ElbaClient } from '../elba-client.js';
import { ElbaAuthError } from '../elba-client.js';

export async function handleListVoices(
  client: ElbaClient,
): Promise<CallToolResult> {
  try {
    const voices = await client.listVoices();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(voices, null, 2),
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
          text: `Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}

export function registerListVoicesTool(
  server: McpServer,
  client: ElbaClient,
): void {
  server.tool(
    'list_voices',
    'List available voices for Elba voice AI agents. Returns voice ID, name, description, and provider. Use the voice ID as the "voice" parameter in upsert_agent.',
    async () => handleListVoices(client),
  );
}
