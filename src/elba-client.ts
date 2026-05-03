export class ElbaAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElbaAuthError';
  }
}

export class ElbaApiError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ElbaApiError';
    this.statusCode = statusCode;
  }
}

export interface Agent {
  id: string;
  name: string;
  status: string;
}

export class ElbaClient {
  private baseUrl: string;
  private token: string;

  constructor(config: { baseUrl: string; token: string }) {
    if (!config.token) {
      throw new Error('Integration token is required');
    }
    this.baseUrl = config.baseUrl;
    this.token = config.token;
  }

  async listAgents(): Promise<Agent[]> {
    const response = await fetch(`${this.baseUrl}/v1/external/agents`, {
      method: 'GET',
      headers: {
        'X-Integration-Token': this.token,
      },
    });

    if (response.status === 401) {
      const body = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      throw new ElbaAuthError(
        (body.message as string) || 'Invalid or expired integration token',
      );
    }

    if (!response.ok) {
      throw new ElbaApiError(
        `Elba API error: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      throw new ElbaApiError(
        'Unexpected response from Elba API: invalid JSON',
        response.status,
      );
    }

    const data = body.data as Record<string, unknown> | undefined;
    const agents = data?.agents ?? body.agents;

    if (agents === undefined || agents === null) {
      throw new ElbaApiError(
        'Unexpected response from Elba API: missing agents data',
        response.status,
      );
    }

    if (!Array.isArray(agents)) {
      throw new ElbaApiError(
        'Unexpected response from Elba API: agents is not an array',
        response.status,
      );
    }

    return agents as Agent[];
  }
}
