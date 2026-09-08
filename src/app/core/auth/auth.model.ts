/**
 * Session payload as the identity service serialises it on `GET /auth/me`.
 *
 * Mirrors `AuthTokenPayload` in scesi-identity-service, snake_case included —
 * {@link toAuthenticatedUser} is the single place that adapts it.
 */
export interface SessionResponse {
  sub: string;
  email: string;
  academic_rank: string;
  roles: string[];
  permissions: string[];
}

/** The signed-in user, in the shape the application works with. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  academicRank: string;
  roles: string[];
  /** Flattened `"resource:action"` slugs granted by the user's roles. */
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function toAuthenticatedUser(
  response: SessionResponse,
): AuthenticatedUser {
  return {
    id: response.sub,
    email: response.email,
    academicRank: response.academic_rank,
    roles: response.roles ?? [],
    permissions: response.permissions ?? [],
  };
}
