import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { skipAuthRefresh } from '../http-context';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => backend.verify());

  /** Puts the service in a signed-in state, the way a real session start would. */
  function signIn(): void {
    auth.loadSession().subscribe();
    backend.expectOne('/auth/me').flush({
      sub: 'user-1',
      email: 'ada@scesi.org',
      academic_rank: 'Miembro',
      roles: [],
      permissions: [],
    });
  }

  it('refreshes the session and replays the request that failed with 401', () => {
    let body: unknown;
    http.get('/profile').subscribe((value) => (body = value));

    backend.expectOne('/profile').flush(null, UNAUTHORIZED);
    backend.expectOne('/auth/refresh').flush({});
    backend.expectOne('/profile').flush({ ok: true });

    expect(body).toEqual({ ok: true });
  });

  it('refreshes once for several requests that expire together', () => {
    const bodies: unknown[] = [];
    http.get('/a').subscribe((value) => bodies.push(value));
    http.get('/b').subscribe((value) => bodies.push(value));

    backend.expectOne('/a').flush(null, UNAUTHORIZED);
    backend.expectOne('/b').flush(null, UNAUTHORIZED);

    const refreshes = backend.match('/auth/refresh');
    expect(refreshes.length).toBe(1);
    refreshes[0].flush({});

    backend.expectOne('/a').flush('a');
    backend.expectOne('/b').flush('b');

    expect(bodies).toEqual(['a', 'b']);
  });

  it('ends the session and redirects when the refresh is rejected', () => {
    signIn();
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    let error: HttpErrorResponse | undefined;

    http.get('/profile').subscribe({
      error: (err: HttpErrorResponse) => (error = err),
    });

    backend.expectOne('/profile').flush(null, UNAUTHORIZED);
    backend.expectOne('/auth/refresh').flush(null, UNAUTHORIZED);

    expect(error?.status).toBe(401);
    expect(auth.isAuthenticated()).toBeFalse();
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'session_expired' },
    });
  });

  it('leaves an error other than 401 untouched', () => {
    let error: HttpErrorResponse | undefined;

    http.get('/profile').subscribe({
      error: (err: HttpErrorResponse) => (error = err),
    });

    backend
      .expectOne('/profile')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(error?.status).toBe(500);
    backend.expectNone('/auth/refresh');
  });

  it('does not refresh a request that opted out', () => {
    let error: HttpErrorResponse | undefined;

    http.get('/auth/login', { context: skipAuthRefresh() }).subscribe({
      error: (err: HttpErrorResponse) => (error = err),
    });

    backend.expectOne('/auth/login').flush(null, UNAUTHORIZED);

    expect(error?.status).toBe(401);
    backend.expectNone('/auth/refresh');
  });

  it('leaves a visitor who was never signed in where they are', () => {
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);

    http.get('/profile').subscribe({ error: () => undefined });

    backend.expectOne('/profile').flush(null, UNAUTHORIZED);
    backend.expectOne('/auth/refresh').flush(null, UNAUTHORIZED);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('surfaces a failure of the replayed request without ending the session', () => {
    signIn();
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    let error: HttpErrorResponse | undefined;

    http.get('/profile').subscribe({
      error: (err: HttpErrorResponse) => (error = err),
    });

    backend.expectOne('/profile').flush(null, UNAUTHORIZED);
    backend.expectOne('/auth/refresh').flush({});
    backend
      .expectOne('/profile')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(error?.status).toBe(500);
    expect(navigate).not.toHaveBeenCalled();
  });
});
