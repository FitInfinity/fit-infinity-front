export interface IWorkoutSession {
  id: number;
  userId: number;
  date: string;
  status: WorkoutSessionStatus;
  moodBefore: number | null;
  moodAfter: number | null;
  durationMin: number | null;
  distanceKm: number | null;
  avgHeartRate: number | null;
  notes: string | null;
  createdAt: string;
  workoutProgram: IWorkoutSessionProgram | null;
}

export interface IWorkoutSessionProgram {
  id: number;
  name: string;
}

export interface IWorkoutSessionListResponse {
  items: IWorkoutSession[];
  total: number;
  page: number;
  perPage: number;
}

export interface IWorkoutSessionCreate {
  date: string;
  workoutProgramId: number | null;
  notes?: string | null;
}

export type WorkoutSessionStatus = 'planned' | 'completed' | 'cancelled';

export const WORKOUT_SESSION_STATUSES: {
  status: WorkoutSessionStatus;
  color: string;
  label: string;
}[] = [
  { status: 'planned', color: '#f49c12', label: 'Запланирована' },
  { status: 'completed', color: '#52b788', label: 'Завершена' },
  { status: 'cancelled', color: '#ef4444', label: 'Отменена' },
];
