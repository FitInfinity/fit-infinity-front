import { IProgramExercise, ProgramType } from './workout-program.interface';

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
  sets: IWorkoutSessionSet[];
}

export interface IWorkoutSessionProgram {
  id: number;
  name: string;
  type: ProgramType;
  exercises: IProgramExercise[];
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

export type IWorkoutSessionUpdate = Partial<IWorkoutSessionCreate>;

export interface IWorkoutSessionStart {
  moodBefore: number | null;
}

export interface IWorkoutSessionProgress {
  moodBefore?: number | null;
  moodAfter?: number | null;
  durationMin?: number | null;
  distanceKm?: number | null;
  avgHeartRate?: number | null;
  notes?: string | null;
  sets?: IWorkoutSessionSetPayload[];
}

export interface IWorkoutSessionSet {
  id: number;
  workoutExerciseId: number;
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  isCompleted: boolean;
}

export interface IWorkoutSessionSetPayload {
  workoutExerciseId: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  isCompleted: boolean;
}

export type WorkoutSessionStatus = 'planned' | 'completed' |  'cancelled';

export const WORKOUT_SESSION_STATUSES: {
  status: WorkoutSessionStatus;
  color: string;
  label: string;
}[] = [
  { status: 'planned', color: '#f49c12', label: 'Запланирована' },
  { status: 'completed', color: '#52b788', label: 'Завершена' },
  { status: 'cancelled', color: '#ef4444', label: 'Пропущена' },
];
