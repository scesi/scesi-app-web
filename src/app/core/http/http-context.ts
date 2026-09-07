import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Marks a request that must not trigger a session refresh when it fails with
 * 401.
 *
 * The authentication endpoints set it: a 401 from `/auth/login` means wrong
 * credentials, and a 401 from `/auth/refresh` means the session is gone. In
 * either case retrying through the refresh flow would loop.
 */
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);

/** Convenience builder for the option bag of an authentication request. */
export function skipAuthRefresh(): HttpContext {
  return new HttpContext().set(SKIP_AUTH_REFRESH, true);
}
