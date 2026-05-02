import {MuscleGroup} from './workout-exercise.interface';

export interface IWorkoutProgram {
  id: number;
  name: string;
  type: ProgramType;
  isActive: boolean;
  isCustom: boolean;
  exerciseCount: number;
  exercises: IProgramExercise[];
  createdAt: string;
}

export interface IWorkoutProgramListResponse {
  items: IWorkoutProgram[];
  total: number;
  page: number;
  perPage: number;
}

export interface IWorkoutProgramCreate {
  name: string;
  type: ProgramType;
  exercises?: IProgramExercisePayload[];
}

export type IWorkoutProgramUpdate = Partial<IWorkoutProgramCreate & { isActive: boolean }>;

export enum ProgramType {
  Strength = 'strength',
  Cardio = 'cardio',
  Stretching = 'stretching',
  Mfr = 'mfr',
  Rehab = 'rehab',
}

export enum ProgramCategory {
  Strength = 'strength',
  Complex = 'complex',
  Cardio = 'cardio',
}

export interface IProgramExercise {
  exerciseId: number;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  order: number;
}

export interface IProgramExercisePayload {
  exerciseId: number;
  sets: number;
  reps: number;
  order: number;
}
