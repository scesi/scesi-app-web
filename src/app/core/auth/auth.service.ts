import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { from } from 'rxjs';
import { User, Session } from './auth.model';
import { apiClient } from '../http/axios.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(user: User): void {
    this.currentUser.set(user);
  }

  refreshSession(): Observable<boolean> {
    return from(apiClient.post<Session>('/auth/refresh')).pipe(
      tap((response) => this.currentUser.set(response.data.user)),
      map(() => true),
      catchError(() => {
        this.currentUser.set(null);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return from(apiClient.post('/auth/logout')).pipe(
      tap(() => this.currentUser.set(null)),
      map(() => undefined as void),
      catchError(() => {
        this.currentUser.set(null);
        return of(undefined as void);
      })
    );
  }
}
