import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthService} from './auth.service';
import {catchError, switchMap, throwError} from 'rxjs';
import {Router} from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = authService.accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authService.accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refresh().pipe(
          switchMap(res => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.clearToken();
            inject(Router).navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
