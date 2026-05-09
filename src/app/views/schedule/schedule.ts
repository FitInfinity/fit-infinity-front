import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { WorkoutCalendar } from '../../shared/components/workout-calendar/workout-calendar';
import { WorkoutSessionService } from '../../shared/services/workout-session.service';
import { ModalService } from '../../shared/components/modal/services/modal.service';
import {
  IWorkoutSession,
  WORKOUT_SESSION_STATUSES,
  WorkoutSessionStatus,
} from '../../interfaces/workout-session.interface';
import {
  formatDateFull,
  formatShortDate,
  moodToEmoji,
  toDateKey,
} from '../../shared/utils/date.utils';
import {
  WorkoutSessionCreateModal,
} from './ui/workout-session-create-modal/workout-session-create-modal';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import {SimpleButton, StatusBadge} from '../../design-system';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [RouterLink, WorkoutCalendar, SvgIcon, StatusBadge, SimpleButton],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Schedule implements OnInit {
  private workoutSessionService = inject(WorkoutSessionService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  workoutSessions = this.workoutSessionService.workoutSessions;
  upcomingWorkoutSessions = this.workoutSessionService.upcomingWorkoutSessions;
  selectedDate = signal(toDateKey(new Date()));
  activeSessionIndex = signal(0);

  selectedWorkoutSessions = computed(() =>
    this.workoutSessions().filter(session => session.date === this.selectedDate()),
  );

  totalSlides = computed(() => this.selectedWorkoutSessions().length + 1);

  activeWorkoutSession = computed(() => this.selectedWorkoutSessions()[this.activeSessionIndex()] ?? null);

  isLastSlide = computed(() => this.activeSessionIndex() === this.totalSlides() - 1);

  ngOnInit(): void {
    const today = new Date();

    this.loadMonth(today.getFullYear(), today.getMonth() + 1);
    this.workoutSessionService.fetchUpcomingWorkoutSessions().subscribe();
  }

  selectDate(dateKey: string): void {
    this.selectedDate.set(dateKey);
    this.activeSessionIndex.set(0);
  }

  onMonthChange(period: { year: number; month: number }): void {
    this.loadMonth(period.year, period.month);
  }

  previousSession(): void {
    this.activeSessionIndex.update(index => Math.max(0, index - 1));
  }

  nextSession(): void {
    this.activeSessionIndex.update(index => Math.min(this.totalSlides() - 1, index + 1));
  }

  getStatusLabel(status: WorkoutSessionStatus): string {
    return WORKOUT_SESSION_STATUSES.find(item => item.status === status)?.label ?? status;
  }

  showCreateModal(): void {
    this.modalService.show(WorkoutSessionCreateModal, {
      selectedDate: this.selectedDate(),
    }).subscribe();
  }

  showUpdateModal(session: IWorkoutSession): void {
    this.modalService.show(WorkoutSessionCreateModal, {
      workoutSession: session,
    }).subscribe();
  }

  deleteWorkoutSession(session: IWorkoutSession): void {
    const isConfirmed = confirm('Удалить эту тренировку из расписания?');

    if (!isConfirmed) {
      return;
    }

    this.workoutSessionService.deleteSession(session.id).subscribe({
      next: () => {
        this.activeSessionIndex.update(index => Math.min(index, this.totalSlides() - 1));
      },
    });
  }

  private loadMonth(year: number, month: number): void {
    this.workoutSessionService.fetchByMonth(year, month).subscribe();
  }

  // TODO: реализовать страницу просмотра тренровки и редиректить именно на нее в дальнейшем
  goToWorkoutSession(session: IWorkoutSession): void {
    this.router.navigate(['/workout-session']);
  }

  protected readonly formatDateFull = formatDateFull;
  protected readonly formatShortDate = formatShortDate;
  protected readonly moodToEmoji = moodToEmoji;
}
