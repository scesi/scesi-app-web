import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { DeviceService } from './core/storage/device.service';
import {
  setupCredentialsInterceptor,
  setupDeviceInfoInterceptor,
  setupAuthRefreshInterceptor,
} from './core/http/interceptors';

function initializeHttpInterceptors(
  authService: AuthService,
  deviceService: DeviceService
): () => void {
  return () => {
    setupCredentialsInterceptor();
    setupDeviceInfoInterceptor(deviceService);
    setupAuthRefreshInterceptor(authService);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeHttpInterceptors,
      deps: [AuthService, DeviceService],
      multi: true,
    },
  ]
};
