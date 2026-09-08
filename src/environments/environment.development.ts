/**
 * Development environment.
 *
 * Requests go to `/api` on the dev-server origin and are forwarded to the
 * local identity service by `proxy.conf.json`. Keeping the browser on a single
 * origin lets the session cookies work without CORS during development.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
