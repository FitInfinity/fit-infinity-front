import {Component, computed, effect, inject, input, InputSignal, OnInit, signal} from '@angular/core';
import {ModalBase} from '../../../../shared/components/modal/modal-base/modal-base';
import {SvgIcon} from '../../../../shared/components/svg-icon/svg-icon';
import {ModalService} from '../../../../shared/components/modal/services/modal.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkoutExerciseService} from '../../../../shared/services/workout-exercise.service';
import {IWorkoutExercise, MuscleGroup} from '../../../../interfaces/workout-exercise.interface';
import {translateMuscleGroup} from '../../../../shared/utils/muscle-group.utils';
import { translateProgramType } from '../../../../shared/utils/workout-program.utils';
import {IProgramExercise, IWorkoutProgram, ProgramType} from '../../../../interfaces/workout-program.interface';
import {WorkoutProgramAddExerciseModal} from '../workout-program-add-exercise-modal/workout-program-add-exercise-modal';
import {WorkoutProgramService} from '../../../../shared/services/workout-program.service';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {ExercisePickerService} from '../../../../shared/services/exercise-picker.service';

@Component({
  selector: 'app-workout-program-settings-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ModalBase,
    SvgIcon,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './workout-program-settings-modal.html',
  styleUrl: './workout-program-settings-modal.scss',
})
export class WorkoutProgramSettingsModal implements OnInit {
  private modalService = inject(ModalService);
  private programService = inject(WorkoutProgramService);
  private picker = inject(ExercisePickerService);

  workoutProgram: InputSignal<IWorkoutProgram | null> = input<IWorkoutProgram | null>(null);
  program = signal<IWorkoutProgram | null>(null);
  isEditing = signal(false);

  isCreateMode = computed(() => !this.workoutProgram());
  modalTitle = computed(() => {
    if (this.isCreateMode()) return 'Создать программу';
    return this.isEditing() ? 'Редактировать программу' : 'Просмотр программы';
  });

  programTypes: ProgramType[] = Object.values(ProgramType) as ProgramType[];
  exercises = signal<IProgramExercise[]>([]);

  form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    type: new FormControl<ProgramType | ''>('', { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    effect(() => {
      const picked = this.picker.picked();
      if (picked.length) {
        this.addExercises(picked);
        this.picker.picked.set([]);
      }
    });
  }

  ngOnInit() {
    this.program.set(this.workoutProgram());
    const prog = this.workoutProgram();

    if (prog) {
      this.form.patchValue({ name: prog.name, type: prog.type });
      // TODO: загрузить упражнения программы
    } else {
      this.isEditing.set(true);
    }
  }

  // --- Упражнения ---

  openAddExerciseModal() {
    this.modalService.show(WorkoutProgramAddExerciseModal).subscribe(); // откроется поверх

    // Но нам нужен результат. Используем другой подход:
    // Модалка вернёт результат через result output
  }

  addExercises(selected: IWorkoutExercise[]) {
    const currentLength = this.exercises().length;
    const newItems: IProgramExercise[] = selected
      .filter(e => !this.exercises().find(ex => ex.exerciseId === e.id))
      .map((e, i) => ({
        exerciseId: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        sets: 3,
        reps: 10,
        order: currentLength + i + 1,
      }));

    this.exercises.update(list => [...list, ...newItems]);
  }

  removeExercise(exerciseId: number) {
    this.exercises.update(list =>
      list.filter(e => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, order: i + 1 }))
    );
  }

  updateSets(exerciseId: number, value: number) {
    this.exercises.update(list =>
      list.map(e => e.exerciseId === exerciseId ? { ...e, sets: value } : e)
    );
  }

  updateReps(exerciseId: number, value: number) {
    this.exercises.update(list =>
      list.map(e => e.exerciseId === exerciseId ? { ...e, reps: value } : e)
    );
  }

  // CDK DnD
  dropExercise(event: CdkDragDrop<IProgramExercise[]>) {
    const list = [...this.exercises()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.exercises.set(list.map((e, i) => ({ ...e, order: i + 1 })));
  }

  // --- Сабмит ---

  onSubmit() {
    if (this.form.invalid) return;

    const { name, type } = this.form.getRawValue();
    const payload = {
      name,
      type: type as ProgramType,
      exercises: this.exercises().map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        order: e.order,
      })),
    };

    const prog = this.program();
    const request$ = prog
      ? this.programService.updateProgram(prog.id, payload)
      : this.programService.createProgram(payload);

    request$.subscribe({
      next: (result) => {
        if (prog) {
          this.program.set(result as IWorkoutProgram);
          this.isEditing.set(false);
        } else {
          this.modalService.hide();
        }
      },
    });
  }

  onCancel() {
    if (this.program()) {
      this.isEditing.set(false);
    } else {
      this.modalService.hide();
    }
  }

  onClose() {
    this.modalService.hide();
  }

  onDelete() {
    const prog = this.program();
    if (!prog) return;
    this.programService.deleteProgram(prog.id).subscribe({
      next: () => this.modalService.hide(),
    });
  }

  toggleEdit() {
    this.isEditing.set(true);
  }

  protected readonly translateProgramType = translateProgramType;
  protected readonly translateMuscleGroup = translateMuscleGroup;
}
