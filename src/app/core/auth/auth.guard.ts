import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';

export const canActivateAuth = () => {
  const auth = inject(AuthService);
  return auth.isAuth ? true : inject(Router).createUrlTree(['/login']);
};

export const canActivateGuest = () => {
  const auth = inject(AuthService);
  return auth.isAuth ? inject(Router).createUrlTree(['/profile/me']) : true;
};
