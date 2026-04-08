import { Routes } from '@angular/router';
import {canActivateAuth, canActivateGuest} from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then(c => c.Layout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard').then(c => c.Dashboard),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./views/schedule/schedule').then(c => c.Schedule),
      },
      {
        path: 'workout-session',
        loadComponent: () => import('./views/workout-session/workout-session').then(c => c.WorkoutSession),
      },
      {
        path: 'workout-program',
        loadComponent: () => import('./views/workout-program/workout-program').then(c => c.WorkoutProgram),
      },
      {
        path: 'statistics',
        loadComponent: () => import('./views/statistics/statistics').then(c => c.Statistics),
      },
      {
        path: 'profile',
        loadComponent: () => import('./views/profile/profile').then(c => c.Profile),
      },
    ],
    canActivate: [canActivateAuth]
  },
  {
    path: 'login',
    loadComponent: () => import('./views/login/login').then(c => c.Login),
    canActivate: [canActivateGuest]
  },
  {
    path: '**',
    loadComponent: () => import('./views/not-found/not-found').then(c => c.NotFound),
  }
];
