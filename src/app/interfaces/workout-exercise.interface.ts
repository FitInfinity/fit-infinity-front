// exercise.interface.ts
export interface IWorkoutExercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  description: string | null;
  tip: string | null;
  isCustom: boolean;
  createdAt: string;
}

export interface IWorkoutExerciseListResponse {
  items: IWorkoutExercise[];
  total: number;
  page: number;
  perPage: number;
}

export interface IWorkoutExerciseCreate {
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  tip?: string;
}

export enum MuscleGroup {
  Legs = 'legs',
  Chest = 'chest',
  Back = 'back',
  Shoulders = 'shoulders',
  Arms = 'arms',
  Core = 'core',
  Posture = 'posture',
  Hip = 'hip',
  PelvicFloor = 'pelvic floor',
  FullBody = 'full body',
  Cardio = 'cardio',
}
