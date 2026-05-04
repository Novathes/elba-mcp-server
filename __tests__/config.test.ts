import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig } from '../src/config.js';

describe('getConfig', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ELBA_INTEGRATION_TOKEN;
    delete process.env.ELBA_API_BASE_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns config with token and default base URL', () => {
    process.env.ELBA_INTEGRATION_TOKEN = 'elba_test_token_123';

    const config = getConfig();

    expect(config.token).toBe('elba_test_token_123');
    expect(config.apiBaseUrl).toBe('https://api.elba.kolsetu.com');
  });

  it('returns config with custom base URL when ELBA_API_BASE_URL is set', () => {
    process.env.ELBA_INTEGRATION_TOKEN = 'elba_test_token_123';
    process.env.ELBA_API_BASE_URL = 'https://custom.api.example.com';

    const config = getConfig();

    expect(config.token).toBe('elba_test_token_123');
    expect(config.apiBaseUrl).toBe('https://custom.api.example.com');
  });

  it('throws when ELBA_INTEGRATION_TOKEN is not set', () => {
    expect(() => getConfig()).toThrow(
      'ELBA_INTEGRATION_TOKEN environment variable is required',
    );
  });

  it('throws when ELBA_INTEGRATION_TOKEN does not start with elba_', () => {
    process.env.ELBA_INTEGRATION_TOKEN = 'invalid_token';

    expect(() => getConfig()).toThrow(
      'Invalid ELBA_INTEGRATION_TOKEN',
    );
  });
});
