import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ElbaClient,
  ElbaAuthError,
  ElbaApiError,
} from '../src/elba-client.js';
import type { UpsertAgentInput } from '../src/elba-client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ElbaClient', () => {
  const baseUrl = 'https://api.elba.kolsetu.com';
  const token = 'elba_test_token_123';
  let client: ElbaClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new ElbaClient({ baseUrl, token });
  });

  it('constructor throws if token is empty string', () => {
    expect(() => new ElbaClient({ baseUrl, token: '' })).toThrow(
      'Integration token is required',
    );
  });

  describe('listAgents', () => {
    it('sends GET to correct URL with X-Integration-Token header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agents: [] } }),
      });

      await client.listAgents();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/external/agents`,
        {
          method: 'GET',
          headers: {
            'X-Integration-Token': token,
          },
        },
      );
    });

    it('returns parsed agents array on 200 response', async () => {
      const agents = [
        { id: '1', name: 'Agent One', status: 'active' },
        { id: '2', name: 'Agent Two', status: 'inactive' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agents } }),
      });

      const result = await client.listAgents();

      expect(result).toEqual(agents);
    });

    it('throws ElbaAuthError on 401 response', async () => {
      const make401 = () => ({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Token expired' }),
      });

      mockFetch.mockResolvedValueOnce(make401());
      await expect(client.listAgents()).rejects.toThrow(ElbaAuthError);

      mockFetch.mockResolvedValueOnce(make401());
      await expect(client.listAgents()).rejects.toThrow('Token expired');
    });

    it('throws ElbaApiError on 500 response', async () => {
      const make500 = () => ({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      mockFetch.mockResolvedValueOnce(make500());
      await expect(client.listAgents()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce(make500());
      await expect(client.listAgents()).rejects.toThrow(
        'Elba API error: 500 Internal Server Error',
      );
    });

    it('surfaces backend error message on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid filter parameter' }),
      });

      await expect(client.listAgents()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid filter parameter' }),
      });
      await expect(client.listAgents()).rejects.toThrow(
        'Invalid filter parameter',
      );
    });

    it('returns empty array when backend returns { data: { agents: [] } }', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agents: [] } }),
      });

      const result = await client.listAgents();

      expect(result).toEqual([]);
    });

    it('throws ElbaApiError on malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      await expect(client.listAgents()).rejects.toThrow(ElbaApiError);
      await expect(
        client.listAgents().catch((e) => {
          throw e;
        }),
      ).rejects.toThrow(); // already consumed above, re-mock:
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });
      await expect(client.listAgents()).rejects.toThrow(
        'Unexpected response from Elba API: invalid JSON',
      );
    });

    it('throws ElbaApiError when response is missing agents field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { something: 'else' } }),
      });

      await expect(client.listAgents()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { something: 'else' } }),
      });
      await expect(client.listAgents()).rejects.toThrow(
        'Unexpected response from Elba API: missing agents data',
      );
    });

    it('throws ElbaApiError when agents is not an array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agents: 'not-an-array' } }),
      });

      await expect(client.listAgents()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agents: 'not-an-array' } }),
      });
      await expect(client.listAgents()).rejects.toThrow(
        'Unexpected response from Elba API: agents is not an array',
      );
    });
  });

  describe('upsertAgent', () => {
    const input: UpsertAgentInput = {
      name: 'Test Agent',
      systemPrompt: 'You are a helpful assistant.',
      voice: 'voice-1',
      agentId: 'agent-123',
    };

    it('sends POST with correct body and headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            agent: {
              id: 'agent-123',
              name: 'Test Agent',
              status: 'active',
              created: true,
            },
          },
        }),
      });

      await client.upsertAgent(input);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/external/agents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Integration-Token': token,
          },
          body: JSON.stringify({
            name: 'Test Agent',
            system_prompt: 'You are a helpful assistant.',
            voice: 'voice-1',
            agent_id: 'agent-123',
          }),
        },
      );
    });

    it('returns agent data on 200', async () => {
      const agentData = {
        id: 'agent-123',
        name: 'Test Agent',
        status: 'active',
        created: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { agent: agentData } }),
      });

      const result = await client.upsertAgent(input);

      expect(result).toEqual(agentData);
    });

    it('throws ElbaAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Token expired' }),
      });

      await expect(client.upsertAgent(input)).rejects.toThrow(ElbaAuthError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Token expired' }),
      });
      await expect(client.upsertAgent(input)).rejects.toThrow('Token expired');
    });

    it('surfaces backend error message on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid voice' }),
      });

      await expect(client.upsertAgent(input)).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid voice' }),
      });
      await expect(client.upsertAgent(input)).rejects.toThrow(
        'Invalid voice',
      );
    });

    it('throws ElbaApiError when response missing agent data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });

      await expect(client.upsertAgent(input)).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });
      await expect(client.upsertAgent(input)).rejects.toThrow(
        'Unexpected response from Elba API: invalid agent data',
      );
    });

    it('throws ElbaApiError when agent is missing required fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            agent: {
              id: 'agent-123',
              name: 'Test Agent',
              // missing status and created
            },
          },
        }),
      });

      await expect(client.upsertAgent(input)).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            agent: {
              id: 'agent-123',
              name: 'Test Agent',
            },
          },
        }),
      });
      await expect(client.upsertAgent(input)).rejects.toThrow(
        'Unexpected response from Elba API: invalid agent data',
      );
    });
  });

  describe('listVoices', () => {
    it('sends GET to /v1/external/voices with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { voices: [] } }),
      });

      await client.listVoices();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/external/voices`,
        {
          method: 'GET',
          headers: {
            'X-Integration-Token': token,
          },
        },
      );
    });

    it('returns voices array on 200', async () => {
      const voices = [
        { id: 'v1', name: 'Alice', description: 'Warm voice', provider: 'elevenlabs' },
        { id: 'v2', name: 'Bob', description: 'Deep voice', provider: 'elevenlabs' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { voices } }),
      });

      const result = await client.listVoices();

      expect(result).toEqual(voices);
    });

    it('throws ElbaAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Token expired' }),
      });

      await expect(client.listVoices()).rejects.toThrow(ElbaAuthError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Token expired' }),
      });
      await expect(client.listVoices()).rejects.toThrow('Token expired');
    });

    it('throws ElbaApiError when voices is not an array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { voices: 'not-an-array' } }),
      });

      await expect(client.listVoices()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { voices: 'not-an-array' } }),
      });
      await expect(client.listVoices()).rejects.toThrow(
        'Unexpected response from Elba API: voices is not an array',
      );
    });

    it('surfaces backend error message on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid provider filter' }),
      });

      await expect(client.listVoices()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid provider filter' }),
      });
      await expect(client.listVoices()).rejects.toThrow(
        'Invalid provider filter',
      );
    });

    it('throws ElbaApiError when voices field is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { something: 'else' } }),
      });

      await expect(client.listVoices()).rejects.toThrow(ElbaApiError);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { something: 'else' } }),
      });
      await expect(client.listVoices()).rejects.toThrow(
        'Unexpected response from Elba API: missing voices data',
      );
    });
  });
});
