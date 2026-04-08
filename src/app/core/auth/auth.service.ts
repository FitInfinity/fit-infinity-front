import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {BASE_API_URL} from '../../app.config';
import {AuthResponse} from '../../interfaces/auth-response.interface';
import {tap} from 'rxjs';

const ACCESS_TOKEN_KEY = 'accessToken';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  baseApiUrl = inject(BASE_API_URL);

  accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

  get isAuth(): boolean {
    return !!this.accessToken;
  }

  private setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  login(payload: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.baseApiUrl}/auth/login`, payload)
      .pipe(tap(res => this.setToken(res.accessToken)));
  }

  logout() {
    return this.http
      .post(`${this.baseApiUrl}/auth/logout`, {})
      .pipe(tap(() => this.clearToken()));
  }

  refresh() {
    return this.http
      .post<AuthResponse>(`${this.baseApiUrl}/auth/refresh`, {})
      .pipe(tap(res => this.setToken(res.accessToken)));
  }
}
