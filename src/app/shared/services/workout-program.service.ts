import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import { BASE_API_URL } from '../../app.config';
import {
  IWorkoutProgram,
  IWorkoutProgramCreate,
  IWorkoutProgramListResponse,
  IWorkoutProgramUpdate,
  ProgramCategory
} from '../../interfaces/workout-program.interface';
import {map, switchMap, tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkoutProgramService {
  private http = inject(HttpClient);
  private baseApiUrl = inject(BASE_API_URL);

  programs = signal<IWorkoutProgram[]>([]);
  total = signal(0);

  getPrograms(params: { page?: number; perPage?: number; search?: string; category?: ProgramCategory } = {}) {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.perPage) httpParams = httpParams.set('perPage', params.perPage);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);

    return this.http.get<IWorkoutProgramListResponse>(`${this.baseApiUrl}/programs`, { params: httpParams })
      .pipe(tap(res => {
        this.programs.set(res.items);
        this.total.set(res.total);
    }));
  }

  getProgram(id: number) {
    return this.http.get<IWorkoutProgram>(`${this.baseApiUrl}/programs/${id}`);
  }

  createProgram(payload: IWorkoutProgramCreate) {
    return this.http.post<IWorkoutProgram>(`${this.baseApiUrl}/programs`, payload)
      .pipe(switchMap(res => this.getPrograms().pipe(map(() => res))));
  }

  updateProgram(id: number, payload: IWorkoutProgramUpdate) {
    return this.http.put<IWorkoutProgram>(`${this.baseApiUrl}/programs/${id}`, payload)
      .pipe(tap(updated => this.programs.update(list =>
        list.map(p => p.id === id ? updated : p)
      )));
  }

  deleteProgram(id: number) {
    return this.http.delete(`${this.baseApiUrl}/programs/${id}`)
      .pipe(tap(() => this.programs.update(list => list.filter(p => p.id !== id))));
  }
}
