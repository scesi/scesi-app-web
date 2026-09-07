import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DeviceInfoService } from '../../device';
import { isApiRequest } from '../api-request';

/**
 * Attaches the `device_info` header to every identity-service request so the
 * backend can record which device a session belongs to.
 *
 * Runs before {@link apiUrlInterceptor}, while the URL is still relative and
 * "is this our API?" is a cheap question to answer.
 */
export const deviceInfoInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const device = inject(DeviceInfoService);

  return next(
    req.clone({ setHeaders: { device_info: device.getDeviceInfo() } }),
  );
};
