import { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../axios.client';
import { DeviceService } from '../../storage/device.service';

export function setupDeviceInfoInterceptor(deviceService: DeviceService): void {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const deviceInfo = deviceService.getDeviceInfo();
      if (config.headers) {
        config.headers['device_info'] = deviceInfo;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}
