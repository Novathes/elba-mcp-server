import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerUpsertAgentTool,
  handleUpsertAgent,
} from '../../src/tools/upsert-agent.js';
import type { ElbaClient, UpsertAgentInput } from '../../src/elba-client.js';
import { ElbaAuthError, ElbaApiError } from '../../src/elba-client.js';

function createMockClient(
  overrides: Partial<ElbaClient> = {},
): ElbaClient {
  return {
    listAgents: vi.fn().mockResolvedValue([]),
    listVoices: vi.fn().mockResolvedValue([]),
    upsertAgent: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as ElbaClient;
}

describe('upsert_agent tool', () => {
  describe('registerUpsertAgentTool', () => {
    let server: McpServer;

    beforeEach(() => {
      server = new McpServer({ name: 'test', version: '0.0.1' });
    });

    it('registers the tool on the server without throwing', () => {
      const client = createMockClient();
      expect(() => registerUpsertAgentTool(server, client)).not.toThrow();
    });
  });

  describe('handleUpsertAgent', () => {
    const baseInput: UpsertAgentInput = {
      name: 'Test Agent',
      systemPrompt: 'You are a helpful assistant.',
    };

    it('returns "Created" message when agent is created', async () => {
      const client = createMockClient({
        upsertAgent: vi.fn().mockResolvedValue({
          id: 'agent-123',
          name: 'Test Agent',
          status: 'active',
          created: true,
        }),
      });

      const result = await handleUpsertAgent(client, baseInput);

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Created');
      expect(result.content[0].text).toContain('Test Agent');
      expect(result.content[0].text).toContain('agent-123');
      expect(result.content[0].text).toContain('active');
    });

    it('returns "Updated" message when agent is updated', async () => {
      const client = createMockClient({
        upsertAgent: vi.fn().mockResolvedValue({
          id: 'agent-123',
          name: 'Test Agent',
          status: 'active',
          created: false,
        }),
      });

      const result = await handleUpsertAgent(client, baseInput);

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Updated');
      expect(result.content[0].text).toContain('Test Agent');
    });

    it('returns error content on auth failure', async () => {
      const client = createMockClient({
        upsertAgent: vi
          .fn()
          .mockRejectedValue(new ElbaAuthError('Invalid token')),
      });

      const result = await handleUpsertAgent(client, baseInput);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Authentication failed');
      expect(result.content[0].text).toContain('Settings → Integrations');
    });

    it('returns error content on API failure', async () => {
      const client = createMockClient({
        upsertAgent: vi
          .fn()
          .mockRejectedValue(new ElbaApiError('Invalid voice ID', 400)),
      });

      const result = await handleUpsertAgent(client, baseInput);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to upsert agent');
      expect(result.content[0].text).toContain('Invalid voice ID');
    });

    it('passes all input fields to client.upsertAgent()', async () => {
      const upsertMock = vi.fn().mockResolvedValue({
        id: 'agent-123',
        name: 'Test Agent',
        status: 'active',
        created: true,
      });
      const client = createMockClient({ upsertAgent: upsertMock });

      const fullInput: UpsertAgentInput = {
        name: 'Test Agent',
        systemPrompt: 'You are a helpful assistant.',
        voice: 'voice-1',
        agentId: 'agent-123',
      };

      await handleUpsertAgent(client, fullInput);

      expect(upsertMock).toHaveBeenCalledWith(fullInput);
    });

    it('handles non-Error thrown values', async () => {
      const client = createMockClient({
        upsertAgent: vi.fn().mockRejectedValue('something weird'),
      });

      const result = await handleUpsertAgent(client, baseInput);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown error');
    });
  });
});
