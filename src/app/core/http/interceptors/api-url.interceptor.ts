import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { isApiRequest } from '../api-request';

/**
 * Resolves relative paths against the identity service and opts them into
 * cookie credentials.
 *
 * `withCredentials` is what makes the browser attach the HttpOnly session
 * cookies, and it is set here — on our own API only — so it can never leak a
 * session to a third-party host.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const base = environment.apiBaseUrl.replace(/\/+$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;

  return next(req.clone({ url: `${base}${path}`, withCredentials: true }));
};
