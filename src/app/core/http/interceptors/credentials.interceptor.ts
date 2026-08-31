import { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../axios.client';

export function setupCredentialsInterceptor(): void {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );
}
