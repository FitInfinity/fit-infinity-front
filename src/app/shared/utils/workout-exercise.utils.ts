import {MuscleGroup} from '../../interfaces/workout-exercise.interface';

export enum ExerciseCategory {
  Strength = 'strength',
  Complex = 'complex',
  Cardio = 'cardio',
}

const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.Strength]: 'Силовые',
  [ExerciseCategory.Complex]: 'Комплексы / МФР / Растяжка',
  [ExerciseCategory.Cardio]: 'Кардио',
};

export function translateExerciseCategory(cat: ExerciseCategory): string {
  return EXERCISE_CATEGORY_LABELS[cat] ?? cat;
}

export const CATEGORY_MUSCLE_GROUPS: Record<ExerciseCategory, MuscleGroup[]> = {
  [ExerciseCategory.Strength]: [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Legs, MuscleGroup.Shoulders, MuscleGroup.Arms, MuscleGroup.Core],
  [ExerciseCategory.Complex]: [MuscleGroup.Posture, MuscleGroup.Hip, MuscleGroup.PelvicFloor, MuscleGroup.FullBody],
  [ExerciseCategory.Cardio]: [MuscleGroup.Cardio],
};
