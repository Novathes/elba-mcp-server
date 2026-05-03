import { validateTokenFormat } from './auth.js';

export interface ElbaConfig {
  token: string;
  apiBaseUrl: string;
}

export function getConfig(): ElbaConfig {
  const token = process.env.ELBA_INTEGRATION_TOKEN;

  if (!token) {
    throw new Error(
      'ELBA_INTEGRATION_TOKEN environment variable is required. ' +
        'Get your token from the Elba Dashboard: Settings → Integrations',
    );
  }

  const validation = validateTokenFormat(token);
  if (!validation.valid) {
    throw new Error(
      `Invalid ELBA_INTEGRATION_TOKEN: ${validation.error}. ` +
        'Get a valid token from the Elba Dashboard: Settings → Integrations',
    );
  }

  return {
    token,
    apiBaseUrl: process.env.ELBA_API_BASE_URL || 'https://api.elba.ai',
  };
}
