import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Typed helper over `HttpClient` for identity-service calls.
 *
 * Paths stay relative — `apiUrlInterceptor` resolves them against the
 * configured API origin and turns on cookie credentials.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(path);
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(path, body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(path, body ?? {});
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(path, body ?? {});
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(path);
  }
}
