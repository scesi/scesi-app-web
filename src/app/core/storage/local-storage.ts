import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorage {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // Silently fail
    }
  }
}
