import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Allows the route only for a signed-in user.
 *
 * On a cold start the session has not been resolved yet, so the guard waits
 * for `loadSession()` instead of bouncing a user who is in fact signed in.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const deny = () => router.createUrlTree(['/login']);

  if (auth.isSessionResolved()) {
    return auth.isAuthenticated() ? true : deny();
  }

  return auth.loadSession().pipe(map((user) => (user ? true : deny())));
};
