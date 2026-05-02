import {ProgramCategory, ProgramType} from '../../interfaces/workout-program.interface';

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  [ProgramType.Strength]: 'Силовая',
  [ProgramType.Cardio]: 'Кардио',
  [ProgramType.Stretching]: 'Растяжка',
  [ProgramType.Mfr]: 'МФР',
  [ProgramType.Rehab]: 'Реабилитация',
};

export function translateProgramType(type: ProgramType): string {
  return PROGRAM_TYPE_LABELS[type] ?? type;
}

const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  [ProgramCategory.Strength]: 'Силовые',
  [ProgramCategory.Complex]: 'Комплексы / МФР / Растяжка',
  [ProgramCategory.Cardio]: 'Кардио',
};

export function translateProgramCategory(cat: ProgramCategory): string {
  return PROGRAM_CATEGORY_LABELS[cat] ?? cat;
}
