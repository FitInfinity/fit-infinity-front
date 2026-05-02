import {MuscleGroup} from './workout-exercise.interface';

export interface IWorkoutProgram {
  id: number;
  name: string;
  type: ProgramType;
  isActive: boolean;
  isCustom: boolean;
  exerciseCount: number;
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
}

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
