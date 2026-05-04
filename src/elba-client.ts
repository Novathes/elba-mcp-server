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

export interface UpsertAgentInput {
  name: string;
  systemPrompt: string;
  voice?: string;
  agentId?: string;
}

export interface UpsertAgentResult {
  id: string;
  name: string;
  status: string;
  created: boolean;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
  provider: string;
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
      let errorMessage = `Elba API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = (await response.json()) as Record<string, unknown>;
        if (errorBody?.message) {
          errorMessage = errorBody.message as string;
        }
      } catch {
        // JSON parse failed, use generic message
      }
      throw new ElbaApiError(errorMessage, response.status);
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

  async upsertAgent(input: UpsertAgentInput): Promise<UpsertAgentResult> {
    const response = await fetch(`${this.baseUrl}/v1/external/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Integration-Token': this.token,
      },
      body: JSON.stringify({
        name: input.name,
        system_prompt: input.systemPrompt,
        voice: input.voice,
        agent_id: input.agentId,
      }),
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
      let errorMessage = `Elba API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = (await response.json()) as Record<string, unknown>;
        if (errorBody?.message) {
          errorMessage = errorBody.message as string;
        }
      } catch {
        // JSON parse failed, use generic message
      }
      throw new ElbaApiError(errorMessage, response.status);
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
    const agent = data?.agent as Record<string, unknown> | undefined;

    if (
      !agent ||
      typeof agent.id !== 'string' ||
      typeof agent.name !== 'string' ||
      typeof agent.status !== 'string' ||
      typeof agent.created !== 'boolean'
    ) {
      throw new ElbaApiError(
        'Unexpected response from Elba API: invalid agent data',
        response.status,
      );
    }

    return agent as unknown as UpsertAgentResult;
  }

  async listVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/v1/external/voices`, {
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
      let errorMessage = `Elba API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = (await response.json()) as Record<string, unknown>;
        if (errorBody?.message) {
          errorMessage = errorBody.message as string;
        }
      } catch {
        // JSON parse failed, use generic message
      }
      throw new ElbaApiError(errorMessage, response.status);
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
    const voices = data?.voices ?? body.voices;

    if (voices === undefined || voices === null) {
      throw new ElbaApiError(
        'Unexpected response from Elba API: missing voices data',
        response.status,
      );
    }

    if (!Array.isArray(voices)) {
      throw new ElbaApiError(
        'Unexpected response from Elba API: voices is not an array',
        response.status,
      );
    }

    return voices as Voice[];
  }
}
