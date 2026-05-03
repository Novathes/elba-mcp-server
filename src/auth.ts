export function validateTokenFormat(token: string): {
  valid: boolean;
  error?: string;
} {
  if (!token || token.trim() === '') {
    return { valid: false, error: 'Integration token is required' };
  }
  if (!token.startsWith('elba_')) {
    return {
      valid: false,
      error: 'Integration token must start with "elba_"',
    };
  }
  return { valid: true };
}
