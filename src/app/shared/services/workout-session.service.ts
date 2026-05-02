import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { of, tap } from 'rxjs';
import { BASE_API_URL } from '../../app.config';
import {
  IWorkoutSession,
  IWorkoutSessionCreate,
  IWorkoutSessionListResponse,
} from '../../interfaces/workout-session.interface';

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

  createSession(payload: IWorkoutSessionCreate) {
    return this.http
      .post<IWorkoutSession>(`${this.baseApiUrl}/workout-sessions`, payload)
      .pipe(
        tap(session => {
          this.workoutSessions.update(current => this.mergeSessions(current, [session]));
          this.upcomingWorkoutSessions.update(current => this.mergeSessions(current, [session])
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 7));
        }),
      );
  }

  private mergeSessions(current: IWorkoutSession[], incoming: IWorkoutSession[]) {
    const currentIds = new Set(current.map(session => session.id));
    const nextSessions = incoming.filter(session => !currentIds.has(session.id));

    return [...current, ...nextSessions];
  }
}
