import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerListVoicesTool,
  handleListVoices,
} from '../../src/tools/list-voices.js';
import type { ElbaClient, Voice } from '../../src/elba-client.js';
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

describe('list_voices tool', () => {
  describe('registerListVoicesTool', () => {
    let server: McpServer;

    beforeEach(() => {
      server = new McpServer({ name: 'test', version: '0.0.1' });
    });

    it('registers the tool on the server without throwing', () => {
      const client = createMockClient();
      expect(() => registerListVoicesTool(server, client)).not.toThrow();
    });
  });

  describe('handleListVoices', () => {
    it('returns voices as JSON when client succeeds', async () => {
      const voices: Voice[] = [
        { id: 'v1', name: 'Alice', description: 'Warm voice', provider: 'elevenlabs' },
        { id: 'v2', name: 'Bob', description: 'Deep voice', provider: 'elevenlabs' },
      ];
      const client = createMockClient({
        listVoices: vi.fn().mockResolvedValue(voices),
      });

      const result = await handleListVoices(client);

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as Voice[];
      expect(parsed).toEqual(voices);
    });

    it('returns error content on auth failure', async () => {
      const client = createMockClient({
        listVoices: vi
          .fn()
          .mockRejectedValue(new ElbaAuthError('Invalid token')),
      });

      const result = await handleListVoices(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Authentication failed');
      expect(result.content[0].text).toContain('Settings → Integrations');
    });

    it('returns error content on API failure', async () => {
      const client = createMockClient({
        listVoices: vi
          .fn()
          .mockRejectedValue(new ElbaApiError('Server error', 500)),
      });

      const result = await handleListVoices(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to list voices');
      expect(result.content[0].text).toContain('Server error');
    });

    it('handles non-Error thrown values', async () => {
      const client = createMockClient({
        listVoices: vi.fn().mockRejectedValue('something weird'),
      });

      const result = await handleListVoices(client);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown error');
    });
  });
});
