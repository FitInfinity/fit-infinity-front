const WORKOUT_SESSION_STATUS_PLANNED = 'planned';
const WORKOUT_SESSION_STATUS_COMPLETED = 'completed';
const WORKOUT_SESSION_STATUS_CANCELLED = 'cancelled';

export type WorkoutSessionStatus =
  | typeof WORKOUT_SESSION_STATUS_PLANNED
  | typeof WORKOUT_SESSION_STATUS_COMPLETED
  | typeof WORKOUT_SESSION_STATUS_CANCELLED;

export const WORKOUT_SESSION_STATUSES = [
  { status: WORKOUT_SESSION_STATUS_PLANNED, label: 'Запланирована' },
  { status: WORKOUT_SESSION_STATUS_COMPLETED, label: 'Завершена' },
  { status: WORKOUT_SESSION_STATUS_CANCELLED, label: 'Отменена' },
];
