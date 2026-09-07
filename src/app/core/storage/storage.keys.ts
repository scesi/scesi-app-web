/**
 * Keys owned by {@link LocalStorageService}.
 *
 * LocalStorage holds UX conveniences only — never tokens or session
 * identifiers. Those live in HttpOnly cookies the browser attaches on its own
 * and JavaScript cannot read.
 */
export const StorageKeys = {
  /** Random, non-secret identifier that keeps a browser recognisable across sessions. */
  deviceId: 'scesi.device_id',
  /** Last e-mail typed on the login form, to prefill it. */
  lastEmail: 'scesi.last_email',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
