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
import { environment } from '../../../../environments/environment';
import { apiUrlInterceptor } from './api-url.interceptor';

describe('apiUrlInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('resolves a relative path against the configured API origin', () => {
    http.get('/auth/me').subscribe();

    const request = backend.expectOne(`${environment.apiBaseUrl}/auth/me`);
    expect(request.request.withCredentials).toBeTrue();
    request.flush({});
  });

  it('accepts a path written without a leading slash', () => {
    http.get('auth/me').subscribe();

    backend.expectOne(`${environment.apiBaseUrl}/auth/me`).flush({});
  });

  it('leaves an absolute URL alone and withholds credentials from it', () => {
    http.get('https://example.org/data').subscribe();

    const request = backend.expectOne('https://example.org/data');
    expect(request.request.withCredentials).toBeFalse();
    request.flush({});
  });
});
