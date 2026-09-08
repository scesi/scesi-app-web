import { Injectable, inject } from '@angular/core';
import { LocalStorageService, StorageKeys } from '../storage';

/**
 * Upper bound for the generated descriptor.
 *
 * The identity service stores it in `refresh_tokens.device_info`, a
 * `varchar(255)` column, so anything longer would be rejected by Postgres.
 */
const MAX_LENGTH = 240;

/** Characters outside printable US-ASCII are illegal in an HTTP header value. */
const NON_ASCII = /[^\x20-\x7E]/g;

/**
 * Builds the descriptor sent as the `device_info` header and as the
 * `deviceInfo` field of the login payload.
 *
 * The descriptor is a diagnostic aid — it lets a user recognise their own
 * sessions in a "signed-in devices" list. It is deliberately not a
 * fingerprint: the stable part is a random identifier this browser generated
 * for itself, not a hash of hardware traits.
 */
@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  private readonly storage = inject(LocalStorageService);

  /** Cached so the descriptor stays identical across every request of a page load. */
  private descriptor: string | null = null;

  getDeviceInfo(): string {
    this.descriptor ??= this.build();
    return this.descriptor;
  }

  /**
   * Random identifier for this browser, persisted so the same device keeps the
   * same id across sessions. Not a secret and not a credential.
   */
  getDeviceId(): string {
    const stored = this.storage.get(StorageKeys.deviceId);
    if (stored) {
      return stored;
    }

    const generated = this.randomId();
    this.storage.set(StorageKeys.deviceId, generated);
    return generated;
  }

  private build(): string {
    const parts = [
      `id=${this.getDeviceId()}`,
      `platform=${this.platform()}`,
      `screen=${this.screenSize()}`,
      `tz=${this.timezone()}`,
      `lang=${navigator.language}`,
    ];

    return parts
      .map((part) => part.replace(NON_ASCII, '').replace(/;/g, ''))
      .join('; ')
      .slice(0, MAX_LENGTH);
  }

  private platform(): string {
    // `navigator.platform` is deprecated; User-Agent Client Hints replace it
    // but are not available in every browser, so fall back.
    const hints = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData;
    return hints?.platform ?? navigator.platform ?? 'unknown';
  }

  private screenSize(): string {
    try {
      return `${screen.width}x${screen.height}`;
    } catch {
      return 'unknown';
    }
  }

  private timezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private randomId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      // Older browsers and insecure origins have no `randomUUID`.
      return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }
}
