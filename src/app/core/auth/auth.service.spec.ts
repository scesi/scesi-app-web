import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DeviceInfoService } from '../device';
import { AuthService } from './auth.service';
import { SessionResponse } from './auth.model';

const SESSION: SessionResponse = {
  sub: 'user-1',
  email: 'ada@scesi.org',
  academic_rank: 'Miembro',
  roles: ['admin'],
  permissions: ['users:read'],
};

describe('AuthService', () => {
  let auth: AuthService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('sends the device descriptor with the credentials and adopts the session', () => {
    const device = TestBed.inject(DeviceInfoService);
    let user = null as { email: string } | null;

    auth
      .login({ email: 'ada@scesi.org', password: 'secret' })
      .subscribe((value) => (user = value));

    const login = backend.expectOne('/auth/login');
    expect(login.request.body).toEqual({
      email: 'ada@scesi.org',
      password: 'secret',
      deviceInfo: device.getDeviceInfo(),
    });
    login.flush({ access_token: 'a', refresh_token: 'r' });

    backend.expectOne('/auth/me').flush(SESSION);

    expect(auth.isAuthenticated()).toBeTrue();
    expect(user?.email).toBe('ada@scesi.org');
  });

  it('maps the session payload onto the application model', () => {
    auth.loadSession().subscribe();
    backend.expectOne('/auth/me').flush(SESSION);

    expect(auth.user()).toEqual({
      id: 'user-1',
      email: 'ada@scesi.org',
      academicRank: 'Miembro',
      roles: ['admin'],
      permissions: ['users:read'],
    });
  });

  it('resolves the session as signed out when there is none', () => {
    auth.loadSession().subscribe();
    backend
      .expectOne('/auth/me')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isAuthenticated()).toBeFalse();
    expect(auth.isSessionResolved()).toBeTrue();
  });

  it('shares one request between concurrent refreshes', () => {
    let completed = 0;
    auth.refreshSession().subscribe(() => (completed += 1));
    auth.refreshSession().subscribe(() => (completed += 1));

    backend.expectOne('/auth/refresh').flush({});

    expect(completed).toBe(2);
  });

  it('starts a new request once the previous refresh settled', () => {
    auth.refreshSession().subscribe();
    backend.expectOne('/auth/refresh').flush({});

    auth.refreshSession().subscribe();
    backend.expectOne('/auth/refresh').flush({});
  });

  it('clears the session even when the server rejects the logout', () => {
    auth.loadSession().subscribe();
    backend.expectOne('/auth/me').flush(SESSION);

    auth.logout().subscribe();
    backend
      .expectOne('/auth/logout')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('revokes every device through the dedicated endpoint', () => {
    auth.logoutAll().subscribe();

    backend.expectOne('/auth/logout-all').flush({});
    expect(auth.isAuthenticated()).toBeFalse();
  });
});
