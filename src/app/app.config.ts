import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth';
import {
  apiUrlInterceptor,
  authRefreshInterceptor,
  deviceInfoInterceptor,
} from './core/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      // Order matters. `deviceInfo` and `apiUrl` run while the URL is still
      // relative; `authRefresh` sits last so it is the first to see a response
      // and replays a request that already carries the final URL and headers.
      withInterceptors([
        deviceInfoInterceptor,
        apiUrlInterceptor,
        authRefreshInterceptor,
      ]),
    ),
    // Resolves an existing cookie session before the first render, so the UI
    // never flashes a signed-out state to a signed-in user.
    provideAppInitializer(() => inject(AuthService).loadSession()),
  ],
};
