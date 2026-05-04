import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ElbaClient,
  ElbaAuthError,
  ElbaApiError,
} from '../src/elba-client.js';

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
});
