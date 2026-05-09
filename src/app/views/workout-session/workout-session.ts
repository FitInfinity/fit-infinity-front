import {ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  IWorkoutSession,
  IWorkoutSessionProgress,
  IWorkoutSessionSetPayload,
  WORKOUT_SESSION_STATUSES,
  WorkoutSessionStatus,
} from '../../interfaces/workout-session.interface';
import {IProgramExercise, ProgramType} from '../../interfaces/workout-program.interface';
import {WorkoutSessionService} from '../../shared/services/workout-session.service';
import {fromDateKey, moodToEmoji} from '../../shared/utils/date.utils';
import {translateMuscleGroup} from '../../shared/utils/muscle-group.utils';
import {StatusBadge} from '../../design-system';

type SetField = 'reps' | 'weight';

interface TrackerExercise extends IProgramExercise {
  setsList: IWorkoutSessionSetPayload[];
}

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [FormsModule, StatusBadge],
  templateUrl: './workout-session.html',
  styleUrl: './workout-session.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutSession implements OnInit, OnDestroy {
  private workoutSessionService = inject(WorkoutSessionService);
  private timerId: number | null = null;

  sessions = this.workoutSessionService.workoutSessionByPage;
  expandedIds = signal<Set<number>>(new Set());
  activeTrackingSession = signal<IWorkoutSession | null>(null);
  trackerSets = signal<IWorkoutSessionSetPayload[]>([]);
  activeExerciseIndex = signal(0);
  elapsedSeconds = signal(0);
  trackerIsLive = signal(false);

  moodDialogSession = signal<IWorkoutSession | null>(null);
  selectedStartMood = signal<number | null>(3);
  finishDialogOpen = signal(false);
  finishMoodBefore = signal<number | null>(null);
  finishMoodAfter = signal<number | null>(null);
  finishDurationMin = signal<number | null>(null);
  finishDistanceKm = signal<number | null>(null);
  finishAvgHeartRate = signal<number | null>(null);
  isSaving = signal(false);

  moods = [
    {value: 1, emoji: '😞', label: 'Очень плохо'},
    {value: 2, emoji: '😕', label: 'Плохо'},
    {value: 3, emoji: '😐', label: 'Нормально'},
    {value: 4, emoji: '🙂', label: 'Хорошо'},
    {value: 5, emoji: '😄', label: 'Отлично'},
  ];

  trackerExercises = computed<TrackerExercise[]>(() => {
    const session = this.activeTrackingSession();
    const exercises = session?.workoutProgram?.exercises ?? [];
    const sets = this.trackerSets();

    return exercises.map(exercise => ({
      ...exercise,
      setsList: sets
        .filter(set => set.workoutExerciseId === exercise.exerciseId)
        .sort((a, b) => a.setNumber - b.setNumber),
    }));
  });

  elapsedLabel = computed(() => this.formatElapsed(this.elapsedSeconds()));

  ngOnInit(): void {
    this.workoutSessionService.fetchSessionsByPage(50, 1).subscribe();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  toggleSession(session: IWorkoutSession): void {
    this.expandedIds.update(ids => {
      const next = new Set(ids);

      if (next.has(session.id)) {
        next.delete(session.id);
      } else {
        next.add(session.id);
        this.workoutSessionService.fetchSession(session.id).subscribe();
      }

      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  openStartMoodDialog(session: IWorkoutSession): void {
    this.moodDialogSession.set(session);
    this.selectedStartMood.set(session.moodBefore ?? 3);
  }

  closeStartMoodDialog(): void {
    this.moodDialogSession.set(null);
  }

  confirmStartWorkout(): void {
    const session = this.moodDialogSession();

    if (!session || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.workoutSessionService.startSession(session.id, {
      moodBefore: this.selectedStartMood(),
    }).subscribe({
      next: updated => {
        this.isSaving.set(false);
        this.closeStartMoodDialog();
        this.enterTracker(updated, true);
      },
      error: () => this.isSaving.set(false),
    });
  }

  openProgressTracker(session: IWorkoutSession, live = false): void {
    this.isSaving.set(true);
    this.workoutSessionService.startSession(session.id, {
      moodBefore: session.moodBefore,
    }).subscribe({
      next: updated => {
        this.isSaving.set(false);
        this.enterTracker(updated, live);
      },
      error: () => this.isSaving.set(false),
    });
  }

  saveProgress(): void {
    const session = this.activeTrackingSession();

    if (!session || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.workoutSessionService.saveProgress(session.id, this.buildProgressPayload(false)).subscribe({
      next: updated => {
        this.isSaving.set(false);
        this.activeTrackingSession.set(updated);
        this.trackerSets.set(this.buildTrackerSets(updated));
      },
      error: () => this.isSaving.set(false),
    });
  }

  openFinishDialog(): void {
    const session = this.activeTrackingSession();

    if (!session) {
      return;
    }

    this.finishMoodBefore.set(session.moodBefore ?? 3);
    this.finishMoodAfter.set(session.moodAfter ?? 3);
    this.finishDurationMin.set(session.durationMin ?? Math.max(1, Math.ceil(this.elapsedSeconds() / 60)));
    this.finishDistanceKm.set(session.distanceKm);
    this.finishAvgHeartRate.set(session.avgHeartRate);
    this.finishDialogOpen.set(true);
  }

  closeFinishDialog(): void {
    this.finishDialogOpen.set(false);
  }

  completeWorkout(): void {
    const session = this.activeTrackingSession();

    if (!session || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.workoutSessionService.completeSession(session.id, this.buildProgressPayload(true)).subscribe({
      next: updated => {
        this.isSaving.set(false);
        this.closeFinishDialog();
        this.enterTracker(updated, false);
        this.closeTracker();
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancelWorkout(session: IWorkoutSession): void {
    const isConfirmed = confirm('Отменить эту тренировку?');

    if (!isConfirmed) {
      return;
    }

    this.workoutSessionService.cancelSession(session.id).subscribe();
  }

  closeTracker(): void {
    this.stopTimer();
    this.activeTrackingSession.set(null);
    this.trackerSets.set([]);
    this.activeExerciseIndex.set(0);
    this.finishDialogOpen.set(false);
    this.trackerIsLive.set(false);
  }

  setActiveExercise(index: number): void {
    this.activeExerciseIndex.set(index);
  }

  nextExercise(): void {
    this.activeExerciseIndex.update(index => Math.min(this.trackerExercises().length - 1, index + 1));
  }

  previousExercise(): void {
    this.activeExerciseIndex.update(index => Math.max(0, index - 1));
  }

  addSet(exerciseId: number): void {
    const sets = this.trackerSets().filter(set => set.workoutExerciseId === exerciseId);
    const nextSetNumber = sets.length + 1;

    this.trackerSets.update(list => [
      ...list,
      {
        workoutExerciseId: exerciseId,
        setNumber: nextSetNumber,
        reps: null,
        weight: null,
        isCompleted: false,
      },
    ]);
  }

  removeSet(exerciseId: number, setNumber: number): void {
    this.trackerSets.update(list => {
      const filtered = list.filter(set => !(set.workoutExerciseId === exerciseId && set.setNumber === setNumber));

      return filtered.map(set => {
        if (set.workoutExerciseId !== exerciseId) {
          return set;
        }

        const previousSets = filtered.filter(item =>
          item.workoutExerciseId === exerciseId && item.setNumber < set.setNumber
        );

        return {...set, setNumber: previousSets.length + 1};
      });
    });
  }

  updateSet(exerciseId: number, setNumber: number, field: SetField, value: number | string | null): void {
    this.trackerSets.update(list => list.map(set => {
      if (set.workoutExerciseId !== exerciseId || set.setNumber !== setNumber) {
        return set;
      }

      return {
        ...set,
        [field]: value === '' || value === null ? null : Number(value),
      };
    }));
  }

  toggleSetCompleted(exerciseId: number, setNumber: number): void {
    this.trackerSets.update(list => list.map(set =>
      set.workoutExerciseId === exerciseId && set.setNumber === setNumber
        ? {...set, isCompleted: !set.isCompleted}
        : set
    ));
  }

  getStatusLabel(status: WorkoutSessionStatus): string {
    return WORKOUT_SESSION_STATUSES.find(item => item.status === status)?.label ?? status;
  }

  getSessionTitle(session: IWorkoutSession): string {
    return session.workoutProgram?.name ?? 'Тренировка без программы';
  }

  getDateDay(dateKey: string): string {
    return String(fromDateKey(dateKey).getDate()).padStart(2, '0');
  }

  getDateMonth(dateKey: string): string {
    return fromDateKey(dateKey).toLocaleDateString('ru-RU', {month: 'short'}).replace('.', '');
  }

  getProgramTypeLabel(session: IWorkoutSession): string {
    const type = session.workoutProgram?.type;

    if (type === ProgramType.Strength) {
      return 'Силовая';
    }

    if (type === ProgramType.Cardio) {
      return 'Кардио';
    }

    return 'Комплекс';
  }

  isStrength(session: IWorkoutSession | null): boolean {
    return session?.workoutProgram?.type === ProgramType.Strength;
  }

  isCardio(session: IWorkoutSession | null): boolean {
    return session?.workoutProgram?.type === ProgramType.Cardio;
  }

  hasHeartRate(session: IWorkoutSession | null): boolean {
    return !!session && [ProgramType.Strength, ProgramType.Cardio].includes(session.workoutProgram?.type as ProgramType);
  }

  hasDistance(session: IWorkoutSession | null): boolean {
    return session?.workoutProgram?.type === ProgramType.Cardio;
  }

  private enterTracker(session: IWorkoutSession, live: boolean): void {
    this.activeTrackingSession.set(session);
    this.trackerSets.set(this.buildTrackerSets(session));
    this.activeExerciseIndex.set(0);
    this.elapsedSeconds.set((session.durationMin ?? 0) * 60);
    this.trackerIsLive.set(live);

    if (live) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  private buildTrackerSets(session: IWorkoutSession): IWorkoutSessionSetPayload[] {
    if (session.sets?.length) {
      return session.sets.map(set => ({
        workoutExerciseId: set.workoutExerciseId,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        isCompleted: set.isCompleted,
      }));
    }

    const result: IWorkoutSessionSetPayload[] = [];

    for (const exercise of session.workoutProgram?.exercises ?? []) {
      for (let setNumber = 1; setNumber <= Math.max(1, exercise.sets); setNumber++) {
        result.push({
          workoutExerciseId: exercise.exerciseId,
          setNumber,
          reps: null,
          weight: null,
          isCompleted: false,
        });
      }
    }

    return result;
  }

  private buildProgressPayload(isComplete: boolean): IWorkoutSessionProgress {
    const session = this.activeTrackingSession();
    const moodBefore = isComplete ? this.finishMoodBefore() : session?.moodBefore ?? null;
    const moodAfter = isComplete ? this.finishMoodAfter() : session?.moodAfter ?? null;
    const durationMin = isComplete
      ? this.finishDurationMin()
      : Math.max(session?.durationMin ?? 0, Math.ceil(this.elapsedSeconds() / 60));

    return {
      moodBefore,
      moodAfter,
      durationMin,
      distanceKm: this.hasDistance(session)
        ? (isComplete ? this.finishDistanceKm() : session?.distanceKm ?? null)
        : null,
      avgHeartRate: this.hasHeartRate(session)
        ? (isComplete ? this.finishAvgHeartRate() : session?.avgHeartRate ?? null)
        : null,
      sets: this.trackerSets(),
    };
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      this.elapsedSeconds.update(seconds => seconds + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private formatElapsed(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;

    return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
  }

  protected readonly moodToEmoji = moodToEmoji;
  protected readonly translateMuscleGroup = translateMuscleGroup;
}
