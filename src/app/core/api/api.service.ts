import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiClient } from '../http/axios.client';

@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(path: string): Observable<T> {
    return from(apiClient.get<T>(path)).pipe(map((response) => response.data));
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return from(apiClient.post<T>(path, body)).pipe(
      map((response) => response.data)
    );
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return from(apiClient.put<T>(path, body)).pipe(
      map((response) => response.data)
    );
  }

  delete<T>(path: string): Observable<T> {
    return from(apiClient.delete<T>(path)).pipe(
      map((response) => response.data)
    );
  }
}
