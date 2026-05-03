import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('startServer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('throws when ELBA_INTEGRATION_TOKEN is missing', async () => {
    delete process.env.ELBA_INTEGRATION_TOKEN;

    const { startServer } = await import('../src/server.js');

    await expect(startServer()).rejects.toThrow(
      'ELBA_INTEGRATION_TOKEN',
    );
  });

  it('throws when token has invalid prefix', async () => {
    process.env.ELBA_INTEGRATION_TOKEN = 'bad_token';

    const { startServer } = await import('../src/server.js');

    await expect(startServer()).rejects.toThrow(
      'Invalid ELBA_INTEGRATION_TOKEN',
    );
  });
});
