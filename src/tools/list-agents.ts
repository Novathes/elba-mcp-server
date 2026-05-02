export interface Agent {
  id: string;
  name: string;
  status: string;
}

export async function listAgents(_organizationId: string): Promise<Agent[]> {
  // TODO: Fetch agents from Elba backend
  throw new Error('Not implemented');
}
