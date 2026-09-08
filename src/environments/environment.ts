/**
 * Production environment.
 *
 * `apiBaseUrl` is the origin of the identity service. Every relative request
 * issued through `HttpClient` is prefixed with it by `apiUrlInterceptor`.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.scesi.org',
};
