import { describe, it, expect } from 'vitest';
import { validateTokenFormat } from '../src/auth.js';

describe('validateTokenFormat', () => {
  it('returns valid for a token starting with elba_', () => {
    const result = validateTokenFormat('elba_abc123xyz');

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns invalid with error for token without elba_ prefix', () => {
    const result = validateTokenFormat('invalid_token');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Integration token must start with "elba_"');
  });

  it('returns invalid with error for empty token', () => {
    const result = validateTokenFormat('');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Integration token is required');
  });

  it('returns invalid with error for whitespace-only token', () => {
    const result = validateTokenFormat('   ');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Integration token is required');
  });
});
