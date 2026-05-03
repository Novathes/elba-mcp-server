import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerListAgentsTool,
  handleListAgents,
} from '../../src/tools/list-agents.js';
import type { ElbaClient, Agent } from '../../src/elba-client.js';
import { ElbaAuthError, ElbaApiError } from '../../src/elba-client.js';

function createMockClient(
  overrides: Partial<ElbaClient> = {},
): ElbaClient {
  return {
    listAgents: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as ElbaClient;
}

describe('list_agents tool', () => {
  describe('registerListAgentsTool', () => {
    let server: McpServer;

    beforeEach(() => {
      server = new McpServer({ name: 'test', version: '0.0.1' });
    });

    it('registers the tool on the server without throwing', () => {
      const client = createMockClient();
      expect(() => registerListAgentsTool(server, client)).not.toThrow();
    });
  });

  describe('handleListAgents', () => {
    it('returns formatted agents when agents exist', async () => {
      const agents: Agent[] = [
        { id: 'agent-1', name: 'Support Bot', status: 'active' },
        { id: 'agent-2', name: 'Sales Bot', status: 'inactive' },
      ];
      const client = createMockClient({
        listAgents: vi.fn().mockResolvedValue(agents),
      });

      const result = await handleListAgents(client);

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as Agent[];
      expect(parsed).toEqual(agents);
    });

    it('returns helpful message when no agents exist', async () => {
      const client = createMockClient({
        listAgents: vi.fn().mockResolvedValue([]),
      });

      const result = await handleListAgents(client);

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('No agents found');
      expect(result.content[0].text).toContain('https://app.elba.ai');
    });

    it('returns auth error for invalid token', async () => {
      const client = createMockClient({
        listAgents: vi
          .fn()
          .mockRejectedValue(new ElbaAuthError('Invalid token')),
      });

      const result = await handleListAgents(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Authentication failed');
      expect(result.content[0].text).toContain('Settings → Integrations');
    });

    it('returns error for API failures', async () => {
      const client = createMockClient({
        listAgents: vi
          .fn()
          .mockRejectedValue(new ElbaApiError('Server error', 500)),
      });

      const result = await handleListAgents(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to list agents');
      expect(result.content[0].text).toContain('Server error');
    });

    it('handles non-Error thrown values', async () => {
      const client = createMockClient({
        listAgents: vi.fn().mockRejectedValue('something weird'),
      });

      const result = await handleListAgents(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown error');
    });
  });
});
