export interface AuthContext {
  organizationId: string;
  token: string;
}

export async function validateToken(_token: string): Promise<AuthContext> {
  // TODO: Validate token against Elba backend
  throw new Error('Not implemented');
}
