import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DeviceInfoService } from '../../device';
import { deviceInfoInterceptor } from './device-info.interceptor';

describe('deviceInfoInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let device: DeviceInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([deviceInfoInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    device = TestBed.inject(DeviceInfoService);
  });

  afterEach(() => backend.verify());

  it('attaches the device descriptor to an API request', () => {
    http.get('/auth/me').subscribe();

    const request = backend.expectOne('/auth/me');
    expect(request.request.headers.get('device_info')).toBe(
      device.getDeviceInfo(),
    );
    request.flush({});
  });

  it('never leaks the descriptor to a third-party origin', () => {
    http.get('https://example.org/data').subscribe();

    const request = backend.expectOne('https://example.org/data');
    expect(request.request.headers.has('device_info')).toBeFalse();
    request.flush({});
  });
});
