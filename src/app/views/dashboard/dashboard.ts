import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WorkoutCalendar } from '../../shared/components/workout-calendar/workout-calendar';
import { WorkoutSessionService } from '../../shared/services/workout-session.service';
import { formatShortDate, toDateKey } from '../../shared/utils/date.utils';
import {
  WORKOUT_SESSION_STATUSES,
  WorkoutSessionStatus,
} from '../../interfaces/workout-session.interface';

@Component({
  selector: 'app-dashboard',
  imports: [WorkoutCalendar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private workoutSessionService = inject(WorkoutSessionService);

  sessions = this.workoutSessionService.workoutSessions;
  selectedDate = signal(toDateKey(new Date()));
  selectedSessions = computed(() =>
    this.sessions().filter(session => session.date === this.selectedDate()),
  );

  ngOnInit(): void {
    const today = new Date();

    this.loadMonth(today.getFullYear(), today.getMonth() + 1);
  }

  selectDate(dateKey: string): void {
    this.selectedDate.set(dateKey);
  }

  onMonthChange(period: { year: number; month: number }): void {
    this.loadMonth(period.year, period.month);
  }

  getStatusLabel(status: WorkoutSessionStatus): string {
    return WORKOUT_SESSION_STATUSES.find(item => item.status === status)?.label ?? status;
  }

  private loadMonth(year: number, month: number): void {
    this.workoutSessionService.fetchByMonth(year, month).subscribe();
  }

  protected readonly formatShortDate = formatShortDate;
}
