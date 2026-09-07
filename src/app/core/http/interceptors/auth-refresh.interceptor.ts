import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { SKIP_AUTH_REFRESH } from '../http-context';

/**
 * Recovers from an expired access token.
 *
 * On a 401 the interceptor asks {@link AuthService} to refresh the session and
 * replays the original request. `refreshSession()` is single-flight, so a page
 * that fires ten requests at once refreshes once and replays all ten.
 *
 * Placed last in the chain, it is the first to see the response and therefore
 * replays a request that already carries the rewritten URL and headers.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_REFRESH)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // Captured before the session is cleared: it decides whether this is a
      // session that just expired or a visitor who never had one.
      const hadSession = auth.isAuthenticated();

      return auth.refreshSession().pipe(
        catchError((refreshError: unknown) => {
          // The refresh token is gone or rejected: the session is over.
          auth.clearSession();

          // Only someone who was signed in gets bounced to the login screen —
          // an anonymous visitor on a public page stays where they are.
          if (hadSession) {
            void router.navigate(['/login'], {
              queryParams: { reason: 'session_expired' },
            });
          }

          return throwError(() => refreshError);
        }),
        // Only the refresh failure is handled above, so an error from the
        // replayed request surfaces to the caller unchanged.
        switchMap(() => next(req)),
      );
    }),
  );
};
