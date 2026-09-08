import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { DeviceInfoService } from '../device';
import { LocalStorageService, StorageKeys } from '../storage';
import { skipAuthRefresh } from '../http/http-context';
import {
  AuthenticatedUser,
  LoginCredentials,
  SessionResponse,
  toAuthenticatedUser,
} from './auth.model';

/**
 * Owns the session.
 *
 * No token ever passes through this service: the identity service keeps the
 * access and refresh tokens in HttpOnly cookies that the browser attaches on
 * its own. What the application needs to know — who is signed in — is read
 * back from `GET /auth/me`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly device = inject(DeviceInfoService);
  private readonly storage = inject(LocalStorageService);

  private readonly currentUser = signal<AuthenticatedUser | null>(null);
  private readonly sessionResolved = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /** False until the first `loadSession()` settles, so guards can wait it out. */
  readonly isSessionResolved = this.sessionResolved.asReadonly();

  /**
   * The refresh currently in flight, shared by every caller.
   *
   * Without it, a page issuing several requests that all expire at once would
   * fire one refresh each and rotate the refresh token out from under itself.
   */
  private refreshInFlight: Observable<void> | null = null;

  login(credentials: LoginCredentials): Observable<AuthenticatedUser | null> {
    return this.http
      .post<unknown>(
        '/auth/login',
        { ...credentials, deviceInfo: this.device.getDeviceInfo() },
        { context: skipAuthRefresh() },
      )
      .pipe(
        tap(() => this.storage.set(StorageKeys.lastEmail, credentials.email)),
        // The response body carries the tokens for non-browser clients; the web
        // app ignores them and reads the session back from the cookies instead.
        switchMap(() => this.loadSession()),
      );
  }

  /**
   * Resolves the session from the cookies the browser already holds.
   *
   * Called on start-up: a 401 here goes through the refresh interceptor, so a
   * reload with an expired access token but a live refresh token restores the
   * session transparently.
   */
  loadSession(): Observable<AuthenticatedUser | null> {
    return this.http.get<SessionResponse>('/auth/me').pipe(
      map(toAuthenticatedUser),
      tap((user) => {
        this.currentUser.set(user);
        this.sessionResolved.set(true);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  refreshSession(): Observable<void> {
    this.refreshInFlight ??= this.http
      .post<unknown>('/auth/refresh', {}, { context: skipAuthRefresh() })
      .pipe(
        map(() => undefined),
        // Clears the slot as soon as the request settles — either way the next
        // 401 deserves a fresh attempt rather than a cached failure.
        finalize(() => {
          this.refreshInFlight = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshInFlight;
  }

  /** Revokes the current session server-side and clears it locally. */
  logout(): Observable<void> {
    return this.revoke('/auth/logout');
  }

  /** Revokes every session of the user, on every device. */
  logoutAll(): Observable<void> {
    return this.revoke('/auth/logout-all');
  }

  /** Drops the local session without calling the backend. */
  clearSession(): void {
    this.currentUser.set(null);
    this.sessionResolved.set(true);
    this.refreshInFlight = null;
  }

  private revoke(path: string): Observable<void> {
    return this.http
      .post<unknown>(path, {}, { context: skipAuthRefresh() })
      .pipe(
        // A failed revocation must not strand the user in a signed-in UI; the
        // cookies are gone from this browser either way.
        catchError(() => of(undefined)),
        tap(() => this.clearSession()),
        map(() => undefined),
      );
  }
}
