import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {environment} from '../environments/environment';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/auth/auth.interceptor';

export const BASE_API_URL = new InjectionToken<string>('BASE_API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: BASE_API_URL, useValue: environment.apiUrl },
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    provideRouter(routes)
  ]
};
