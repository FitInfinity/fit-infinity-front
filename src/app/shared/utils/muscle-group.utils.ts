import {MuscleGroup} from '../../interfaces/workout-exercise.interface';

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.Legs]: 'Ноги',
  [MuscleGroup.Chest]: 'Грудь',
  [MuscleGroup.Back]: 'Спина',
  [MuscleGroup.Shoulders]: 'Плечи',
  [MuscleGroup.Arms]: 'Руки',
  [MuscleGroup.Core]: 'Кор',
  [MuscleGroup.Posture]: 'Осанка',
  [MuscleGroup.Hip]: 'Бёдра',
  [MuscleGroup.PelvicFloor]: 'Тазовое дно',
  [MuscleGroup.FullBody]: 'Всё тело',
  [MuscleGroup.Cardio]: 'Кардио',
};

export function translateMuscleGroup(group: MuscleGroup): string {
  return MUSCLE_GROUP_LABELS[group] ?? group;
}
