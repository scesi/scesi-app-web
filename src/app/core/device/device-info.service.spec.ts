import { TestBed } from '@angular/core/testing';
import { StorageKeys } from '../storage';
import { DeviceInfoService } from './device-info.service';

describe('DeviceInfoService', () => {
  let device: DeviceInfoService;

  beforeEach(() => {
    localStorage.removeItem(StorageKeys.deviceId);
    TestBed.configureTestingModule({});
    device = TestBed.inject(DeviceInfoService);
  });

  afterEach(() => localStorage.removeItem(StorageKeys.deviceId));

  it('produces a descriptor that is legal as an HTTP header value', () => {
    expect(device.getDeviceInfo()).toMatch(/^[\x20-\x7E]+$/);
  });

  it('stays within the column the identity service stores it in', () => {
    expect(device.getDeviceInfo().length).toBeLessThanOrEqual(240);
  });

  it('reuses the persisted device id instead of minting a new one', () => {
    const id = device.getDeviceId();

    expect(device.getDeviceId()).toBe(id);
    expect(localStorage.getItem(StorageKeys.deviceId)).toBe(id);
  });

  it('returns the same descriptor for every request of a page load', () => {
    expect(device.getDeviceInfo()).toBe(device.getDeviceInfo());
  });
});
