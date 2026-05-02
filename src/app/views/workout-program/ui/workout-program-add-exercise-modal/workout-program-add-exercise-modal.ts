import {Component, inject, OnInit, output, signal} from '@angular/core';
import {ModalBase} from '../../../../shared/components/modal/modal-base/modal-base';
import {SvgIcon} from '../../../../shared/components/svg-icon/svg-icon';
import {ModalService} from '../../../../shared/components/modal/services/modal.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WorkoutExerciseService} from '../../../../shared/services/workout-exercise.service';
import {IWorkoutExercise, MuscleGroup} from '../../../../interfaces/workout-exercise.interface';
import {translateMuscleGroup} from '../../../../shared/utils/muscle-group.utils';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {ExercisePickerService} from '../../../../shared/services/exercise-picker.service';

@Component({
  selector: 'app-workout-program-add-exercise-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ModalBase,
    SvgIcon
  ],
  templateUrl: './workout-program-add-exercise-modal.html',
  styleUrl: './workout-program-add-exercise-modal.scss',
})
export class WorkoutProgramAddExerciseModal implements OnInit {
  private modalService = inject(ModalService);
  private exerciseService = inject(WorkoutExerciseService);
  private picker = inject(ExercisePickerService);

  result = output<IWorkoutExercise[]>();

  search = new FormControl('');
  exercises = signal<IWorkoutExercise[]>([]);
  selected = signal<IWorkoutExercise[]>([]);
  activeMuscleGroup = signal<MuscleGroup | null>(null);
  muscleGroups: MuscleGroup[] = Object.values(MuscleGroup) as MuscleGroup[];

  ngOnInit() {
    this.loadExercises();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadExercises());
  }

  loadExercises() {
    const group = this.activeMuscleGroup();
    this.exerciseService.getExercises({
      perPage: 50,
      search: this.search.value || undefined,
      muscleGroups: group ? [group] : undefined,
    }).subscribe(res => this.exercises.set(res.items));
  }

  selectMuscleGroup(group: MuscleGroup) {
    this.activeMuscleGroup.set(this.activeMuscleGroup() === group ? null : group);
    this.loadExercises();
  }

  toggleExercise(exercise: IWorkoutExercise) {
    this.selected.update(list =>
      list.find(e => e.id === exercise.id)
        ? list.filter(e => e.id !== exercise.id)
        : [...list, exercise]
    );
  }

  isSelected(id: number): boolean {
    return !!this.selected().find(e => e.id === id);
  }

  confirm() {
    this.picker.picked.set(this.selected());
    this.modalService.hide();
  }

  protected readonly translateMuscleGroup = translateMuscleGroup;
}
