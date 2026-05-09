import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { of, tap } from 'rxjs';
import { BASE_API_URL } from '../../app.config';
import {
  IWorkoutSession,
  IWorkoutSessionCreate,
  IWorkoutSessionListResponse,
  IWorkoutSessionProgress,
  IWorkoutSessionStart,
  IWorkoutSessionUpdate,
} from '../../interfaces/workout-session.interface';
import { toDateKey } from '../utils/date.utils';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionService {
  private http = inject(HttpClient);
  private baseApiUrl = inject(BASE_API_URL);
  private loadedMonths = signal<Set<string>>(new Set());

  workoutSessions = signal<IWorkoutSession[]>([]);
  upcomingWorkoutSessions = signal<IWorkoutSession[]>([]);
  workoutSessionByPage = signal<IWorkoutSession[]>([]);

  fetchByMonth(year: number, month: number) {
    const key = `${year}-${month}`;

    if (this.loadedMonths().has(key)) {
      return of(this.workoutSessions());
    }

    const params = new HttpParams().set('year', year).set('month', month);

    return this.http
      .get<IWorkoutSession[]>(`${this.baseApiUrl}/workout-sessions`, { params })
      .pipe(
        tap(sessions => {
          this.workoutSessions.update(current => this.mergeSessions(current, sessions));
          this.loadedMonths.update(months => new Set(months).add(key));
        }),
      );
  }

  fetchUpcomingWorkoutSessions(limit: number = 7) {
    if (this.upcomingWorkoutSessions().length) {
      return of(this.upcomingWorkoutSessions());
    }

    const params = new HttpParams().set('limit', limit);

    return this.http
      .get<IWorkoutSession[]>(`${this.baseApiUrl}/workout-sessions/upcoming`, { params })
      .pipe(tap(sessions => this.upcomingWorkoutSessions.set(sessions)));
  }

  fetchSessionsByPage(limit: number = 10, page: number = 1) {
    const params = new HttpParams().set('limit', limit).set('page', page);

    return this.http
      .get<IWorkoutSessionListResponse>(`${this.baseApiUrl}/workout-sessions/all`, { params })
      .pipe(tap(res => this.workoutSessionByPage.set(res.items)));
  }

  fetchSession(id: number) {
    return this.http
      .get<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}`)
      .pipe(tap(session => this.upsertSession(session)));
  }

  createSession(payload: IWorkoutSessionCreate) {
    return this.http
      .post<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions`, payload)
      .pipe(
        tap(session => {
          this.upsertSession(session);
        }),
      );
  }

  updateSession(id: number, payload: IWorkoutSessionUpdate) {
    return this.http
      .put<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}`, payload)
      .pipe(
        tap(session => {
          this.upsertSession(session);
        }),
      );
  }

  startSession(id: number, payload: IWorkoutSessionStart) {
    return this.http
      .post<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}/start`, payload)
      .pipe(tap(session => this.upsertSession(session)));
  }

  saveProgress(id: number, payload: IWorkoutSessionProgress) {
    return this.http
      .put<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}/progress`, payload)
      .pipe(tap(session => this.upsertSession(session)));
  }

  completeSession(id: number, payload: IWorkoutSessionProgress) {
    return this.http
      .post<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}/complete`, payload)
      .pipe(tap(session => this.upsertSession(session)));
  }

  cancelSession(id: number) {
    return this.http
      .post<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions/${id}/cancel`, {})
      .pipe(tap(session => this.upsertSession(session)));
  }

  deleteSession(id: number) {
    return this.http
      .delete(`${this.baseApiUrl}/workout-sessions/${id}`)
      .pipe(
        tap(() => {
          this.workoutSessions.update(current => current.filter(session => session.id !== id));
          this.upcomingWorkoutSessions.update(current => current.filter(session => session.id !== id));
          this.workoutSessionByPage.update(current => current.filter(session => session.id !== id));
        }),
      );
  }

  private upsertSession(session: IWorkoutSession): void {
    this.workoutSessions.update(current => this.mergeSessions(current, [session]));
    this.workoutSessionByPage.update(current => this.mergeSessions(current, [session]));
    this.upcomingWorkoutSessions.update(current => {
      const today = toDateKey(new Date());

      return this.mergeSessions(current, [session])
        .filter(item => item.status === 'planned' && item.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 7);
    });
  }

  private mergeSessions(current: IWorkoutSession[], incoming: IWorkoutSession[]) {
    const incomingById = new Map(incoming.map(session => [session.id, session]));
    const existing = current.map(session => incomingById.get(session.id) ?? session);
    const existingIds = new Set(current.map(session => session.id));
    const nextSessions = incoming.filter(session => !existingIds.has(session.id));

    return [...existing, ...nextSessions];
  }
}
