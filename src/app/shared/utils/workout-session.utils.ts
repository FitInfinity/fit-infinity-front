import {WORKOUT_SESSION_STATUSES, WorkoutSessionStatus} from '../constants';

export function getStatusLabel(status: WorkoutSessionStatus): string {
  return WORKOUT_SESSION_STATUSES.find(item => item.status === status)?.label ?? status;
}
