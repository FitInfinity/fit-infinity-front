import {Component, computed, inject, input, InputSignal, OnInit, signal} from '@angular/core';
import {ModalBase} from '../../../../shared/components/modal/modal-base/modal-base';
import {SvgIcon} from '../../../../shared/components/svg-icon/svg-icon';
import {ModalService} from '../../../../shared/components/modal/services/modal.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkoutExerciseService} from '../../../../shared/services/workout-exercise.service';
import {IWorkoutExercise, MuscleGroup} from '../../../../interfaces/workout-exercise.interface';
import {translateMuscleGroup} from '../../../../shared/utils/muscle-group.utils';

@Component({
  selector: 'app-workout-exercise-settings-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ModalBase,
    SvgIcon
  ],
  templateUrl: './workout-exercise-settings-modal.html',
  styleUrl: './workout-exercise-settings-modal.scss',
})
export class WorkoutExerciseSettingsModal implements OnInit {
  private modalService = inject(ModalService);
  private workoutExerciseService = inject(WorkoutExerciseService);

  currentExercise = signal<IWorkoutExercise | null>(null);
  workoutExercise: InputSignal<IWorkoutExercise | null> = input<IWorkoutExercise | null>(null);
  isEditing = signal(false);

  isCreateMode = computed(() => !this.workoutExercise());

  modalTitle = computed(() => {
    if (this.isCreateMode()) return 'Создать упражнение';
    return this.isEditing() ? 'Редактировать упражнение' : 'Просмотр упражнения';
  });

  muscleGroups: MuscleGroup[] = Object.values(MuscleGroup) as MuscleGroup[];

  form = new FormGroup({
    name: new FormControl<string>('', {nonNullable: true, validators: Validators.required}),
    muscleGroup: new FormControl<MuscleGroup | ''>('', {nonNullable: true, validators: Validators.required}),
    description: new FormControl<string>('', {nonNullable: false}),
    tip: new FormControl<string>('', {nonNullable: false}),
  });

  ngOnInit() {
    this.currentExercise.set(this.workoutExercise());
    const exercise = this.workoutExercise();

    if (exercise) {
      this.form.patchValue({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        description: exercise.description,
        tip: exercise.tip,
      });
    } else {
      this.isEditing.set(true);
    }
  }

  // Переключение между режимами создания/редактирования
  toggleEdit() {
    this.isEditing.set(true);
  }

  // Удаление упражнения
  onDelete() {
    const exercise = this.workoutExercise();
    if (!exercise) return;

    this.workoutExerciseService.deleteExercise(exercise.id).subscribe({
      next: () => this.modalService.hide(),
    });
  }

  // Закрытие модального окна при создании, и возвращение в режим просмотра при редактировании
  onCancel() {
    if (this.currentExercise()) {
      // режим редактирования
      this.form.patchValue({
        name: this.currentExercise()!.name,
        muscleGroup: this.currentExercise()!.muscleGroup,
        description: this.currentExercise()!.description,
        tip: this.currentExercise()!.tip,
      });
      this.isEditing.set(false);
    } else {
      // режим создания
      this.modalService.hide();
    }
  }

  // Закрытие модельного окна по крестику
  onClose() {
    this.modalService.hide();
  }

  // Отправка данных при создании/редактировании упражнения
  onSubmit() {
    if (this.form.invalid) return;

    const { name, muscleGroup, description } = this.form.getRawValue();
    const payload = { name, muscleGroup: muscleGroup as MuscleGroup, description: description || undefined };
    const exercise = this.workoutExercise();

    const request$ = exercise
      ? this.workoutExerciseService.updateExercise(exercise.id, payload)
      : this.workoutExerciseService.createExercise(payload);

    request$.subscribe({
      next: (result) => {
        if (this.currentExercise()) {
          // режим редактирования
          this.currentExercise.set(result as IWorkoutExercise);
          this.isEditing.set(false);
        } else {
          // режим создания
          this.modalService.hide();
        }
      },
    });
  }

  protected readonly translateMuscleGroup = translateMuscleGroup;
}
