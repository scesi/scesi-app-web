import { Injectable } from '@angular/core';
import { StorageKey } from './storage.keys';

/**
 * Thin wrapper over `localStorage` for UX-only data.
 *
 * Every access is guarded: Safari in private mode and browsers configured to
 * block site data throw on read and write, and the app must keep working with
 * nothing stored.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get(key: StorageKey): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: StorageKey, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable or over quota: the value is a convenience, drop it.
    }
  }

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing to do if storage is unavailable.
    }
  }
}
