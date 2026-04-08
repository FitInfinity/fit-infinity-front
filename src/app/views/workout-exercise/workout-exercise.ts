import {Component, computed, inject, signal} from '@angular/core';
import {SvgIcon} from "../../shared/components/svg-icon/svg-icon";
import {ModalService} from '../../shared/components/modal/services/modal.service';
import {WorkoutExerciseService} from '../../shared/services/workout-exercise.service';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {
  CATEGORY_MUSCLE_GROUPS,
  ExerciseCategory, translateExerciseCategory,
} from '../../shared/utils/workout-exercise.utils';
import {translateMuscleGroup} from '../../shared/utils/muscle-group.utils';
import {IWorkoutExercise} from '../../interfaces/workout-exercise.interface';
import {WorkoutExerciseSettingsModal} from './ui/workout-exercise-settings-modal/workout-exercise-settings-modal';

@Component({
  selector: 'app-workout-exercise',
  imports: [
    SvgIcon,
    ReactiveFormsModule
  ],
  templateUrl: './workout-exercise.html',
  styleUrl: './workout-exercise.scss',
})
export class WorkoutExercise {
  private modalService = inject(ModalService);
  private exerciseService = inject(WorkoutExerciseService);

  exercises= this.exerciseService.exercises;
  search = new FormControl('');
  currentPage = signal(1);
  perPage = 18;

  totalPages = computed(() => Math.ceil(this.exerciseService.total() / this.perPage));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  categories: ExerciseCategory[] = Object.values(ExerciseCategory) as ExerciseCategory[];
  activeCategory = signal<ExerciseCategory | null>(null);

  ngOnInit() {
    this.loadExercises();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadExercises();
      });
  }

  selectCategory(cat: ExerciseCategory) {
    this.activeCategory.set(this.activeCategory() === cat ? null : cat);
    this.currentPage.set(1);
    this.loadExercises();
  }

  resetCategory() {
    this.activeCategory.set(null);
    this.currentPage.set(1);
    this.loadExercises();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadExercises();
  }

  loadExercises() {
    const cat = this.activeCategory();

    this.exerciseService.getExercises({
      page: this.currentPage(),
      perPage: this.perPage,
      search: this.search.value || undefined,
      muscleGroups: cat ? CATEGORY_MUSCLE_GROUPS[cat] : undefined,
    }).subscribe();
  }

  // Создание
  showCreateModal() {
    this.modalService.show(WorkoutExerciseSettingsModal);
  }

  // Просмотр (с возможностью перейти в редактирование)
  showViewModal(exercise: IWorkoutExercise) {
    this.modalService.show(WorkoutExerciseSettingsModal, { workoutExercise: exercise });
  }

  protected readonly translateMuscleGroup = translateMuscleGroup;
  protected readonly translateExerciseCategory = translateExerciseCategory;
}
