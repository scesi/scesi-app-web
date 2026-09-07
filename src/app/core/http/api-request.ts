/**
 * Requests to the identity service are written as relative paths
 * (`/auth/login`); anything absolute is a third party.
 *
 * The distinction decides which requests carry session cookies and the
 * `device_info` header — neither should ever be sent to another origin.
 */
export function isApiRequest(url: string): boolean {
  return !/^[a-z][a-z0-9+.-]*:\/\//i.test(url) && !url.startsWith('//');
}
