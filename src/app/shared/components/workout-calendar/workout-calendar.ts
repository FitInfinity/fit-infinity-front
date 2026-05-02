import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  IWorkoutSession,
  WORKOUT_SESSION_STATUSES,
} from '../../../interfaces/workout-session.interface';
import { fromDateKey, toDateKey } from '../../utils/date.utils';
import { SvgIcon } from '../svg-icon/svg-icon';

interface WorkoutCalendarDay {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  sessions: IWorkoutSession[];
}

@Component({
  selector: 'app-workout-calendar',
  imports: [SvgIcon],
  templateUrl: './workout-calendar.html',
  styleUrl: './workout-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutCalendar {
  workoutSessions = input<IWorkoutSession[]>([]);
  selectedDate = input(toDateKey(new Date()));
  showLegend = input(true);
  compact = input(false);

  dayClick = output<string>();
  selectedDateChange = output<string>();
  monthChange = output<{ year: number; month: number }>();

  selected = computed(() => fromDateKey(this.selectedDate()));
  activeMonth = signal(this.getMonthStart(this.selected()));
  periodLabel = computed(() => this.formatPeriodLabel(this.activeMonth()));
  calendarDays = computed(() => this.buildCalendarDays(this.activeMonth()));
  workoutStatuses = WORKOUT_SESSION_STATUSES;
  weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  constructor() {
    effect(() => {
      const selectedMonth = this.getMonthStart(this.selected());

      const activeMonthKey = untracked(() => this.getMonthKey(this.activeMonth()));

      if (this.getMonthKey(selectedMonth) !== activeMonthKey) {
        this.activeMonth.set(selectedMonth);
        this.emitMonthChange(selectedMonth);
      }
    });
  }

  changeMonth(monthOffset: number): void {
    const activeMonth = this.activeMonth();
    const nextMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + monthOffset, 1);

    this.activeMonth.set(nextMonth);
    this.emitMonthChange(nextMonth);
  }

  selectDay(day: WorkoutCalendarDay): void {
    if (!day.isCurrentMonth) {
      return;
    }

    this.selectedDateChange.emit(day.dateKey);
    this.dayClick.emit(day.dateKey);
  }

  private buildCalendarDays(activeMonth: Date): WorkoutCalendarDay[] {
    const firstDay = this.getMonthStart(activeMonth);
    const lastDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0);
    const startDate = this.getWeekStart(firstDay);
    const endDate = this.getWeekEnd(lastDay);
    const days: WorkoutCalendarDay[] = [];

    for (let date = startDate; date <= endDate; date = this.addDays(date, 1)) {
      const isCurrentMonth = this.isSameMonth(date, activeMonth);
      const dateKey = toDateKey(date);

      days.push({
        date,
        dateKey,
        day: date.getDate(),
        isCurrentMonth,
        isSelected: isCurrentMonth && dateKey === this.selectedDate(),
        isToday: isCurrentMonth && dateKey === toDateKey(new Date()),
        sessions: isCurrentMonth ? this.getSessionsByDate(date).slice(0, 3) : [],
      });
    }

    return days;
  }

  private emitMonthChange(date: Date): void {
    this.monthChange.emit({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  private formatPeriodLabel(date: Date): string {
    const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);

    return `${month} ${date.getFullYear()}`;
  }

  private getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    return this.addDays(date, mondayOffset);
  }

  private getWeekEnd(date: Date): Date {
    const day = date.getDay();
    const sundayOffset = day === 0 ? 0 : 7 - day;

    return this.addDays(date, sundayOffset);
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  private isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  private getSessionsByDate(date: Date): IWorkoutSession[] {
    const dateKey = toDateKey(date);

    return this.workoutSessions().filter(session => session.date === dateKey);
  }
}
