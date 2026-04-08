import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {BASE_API_URL} from '../../app.config';
import {AuthResponse} from '../../interfaces/auth-response.interface';
import {tap} from 'rxjs';
import {Profile} from '../../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  http = inject(HttpClient);
  router = inject(Router);
  baseApiUrl = inject(BASE_API_URL);

  profile = signal<Profile | null>(null);

  getMe() {
    return this.http.get<Profile>(`${this.baseApiUrl}/user/me`)
      .pipe(
        tap(res => this.profile.set(res))
      );
  }
}
