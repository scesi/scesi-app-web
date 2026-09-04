import axios from 'axios';
import { environment } from '../../../environments/environment';

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
});
