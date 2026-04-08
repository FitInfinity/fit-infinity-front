import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {BASE_API_URL} from '../../app.config';
import {AuthResponse} from '../../interfaces/auth-response.interface';
import {map, switchMap, tap} from 'rxjs';
import {Profile} from '../../interfaces/profile.interface';
import {
  MuscleGroup, IWorkoutExercise,
  IWorkoutExerciseCreate,
  IWorkoutExerciseListResponse
} from '../../interfaces/workout-exercise.interface';

@Injectable({ providedIn: 'root' })
export class WorkoutExerciseService {
  private http = inject(HttpClient);
  private baseApiUrl = inject(BASE_API_URL);

  exercises: WritableSignal<IWorkoutExercise[]> = signal<IWorkoutExercise[]>([]);
  total = signal(0);
  highlightedId = signal<number | null>(null);

  getExercises(params: { page?: number; perPage?: number; search?: string; muscleGroups?: MuscleGroup[] } = {}) {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.perPage) httpParams = httpParams.set('perPage', params.perPage);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.muscleGroups?.length) httpParams = httpParams.set('muscleGroups', params.muscleGroups.join(','));

    return this.http.get<IWorkoutExerciseListResponse>(`${this.baseApiUrl}/exercises`, { params: httpParams })
      .pipe(tap(res => {
        this.exercises.set(res.items);
        this.total.set(res.total);
      }));
  }

  createExercise(payload: IWorkoutExerciseCreate) {
    return this.http.post<IWorkoutExercise>(`${this.baseApiUrl}/exercises`, payload)
      .pipe(switchMap(res => this.getExercises().pipe(map(() => res))));
  }

  updateExercise(id: number, payload: Partial<IWorkoutExerciseCreate>) {
    return this.http.put<IWorkoutExercise>(`${this.baseApiUrl}/exercises/${id}`, payload)
      .pipe(tap(updated => this.exercises.update(list =>
        list.map(e => e.id === id ? updated : e)
      )));
  }

  deleteExercise(id: number) {
    return this.http.delete(`${this.baseApiUrl}/exercises/${id}`)
      .pipe(tap(() => this.exercises.update(list => list.filter(e => e.id !== id))));
  }
}
