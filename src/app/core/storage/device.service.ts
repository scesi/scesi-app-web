import { Injectable, inject } from '@angular/core';
import { LocalStorage } from './local-storage';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly DEVICE_KEY = 'device_info';
  private readonly localStorage = inject(LocalStorage);

  getDeviceInfo(): string {
    const stored = this.localStorage.getItem(this.DEVICE_KEY);
    if (stored) return stored;

    const info = JSON.stringify({
      platform: navigator.platform,
      language: navigator.language,
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
    });

    this.localStorage.setItem(this.DEVICE_KEY, info);
    return info;
  }

  clearDeviceInfo(): void {
    this.localStorage.removeItem(this.DEVICE_KEY);
  }
}
