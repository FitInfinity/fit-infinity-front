import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SvgIcon} from "../../shared/components/svg-icon/svg-icon";
import {translateExerciseCategory} from "../../shared/utils/workout-exercise.utils";
import {translateMuscleGroup} from "../../shared/utils/muscle-group.utils";
import {IWorkoutProgram, ProgramCategory} from '../../interfaces/workout-program.interface';
import {translateProgramCategory, translateProgramType } from '../../shared/utils/workout-program.utils';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {ModalService} from '../../shared/components/modal/services/modal.service';
import {WorkoutProgramService} from '../../shared/services/workout-program.service';
import {WorkoutProgramSettingsModal} from './ui/workout-program-settings-modal/workout-program-settings-modal';

@Component({
  selector: 'app-workout-program',
  imports: [
    FormsModule,
    SvgIcon,
    ReactiveFormsModule
  ],
  templateUrl: './workout-program.html',
  styleUrl: './workout-program.scss',
})
export class WorkoutProgram implements OnInit {
  private modalService = inject(ModalService);
  private programService = inject(WorkoutProgramService);

  programs = this.programService.programs;
  search = new FormControl('');
  currentPage = signal(1);
  perPage = 18;

  totalPages = computed(() => Math.ceil(this.programService.total() / this.perPage));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  categories: ProgramCategory[] = Object.values(ProgramCategory) as ProgramCategory[];
  activeCategory = signal<ProgramCategory | null>(null);

  ngOnInit() {
    this.loadPrograms();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadPrograms();
      });
  }

  selectCategory(cat: ProgramCategory) {
    this.activeCategory.set(this.activeCategory() === cat ? null : cat);
    this.currentPage.set(1);
    this.loadPrograms();
  }

  resetCategory() {
    this.activeCategory.set(null);
    this.currentPage.set(1);
    this.loadPrograms();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadPrograms();
  }

  loadPrograms() {
    const cat = this.activeCategory();
    this.programService.getPrograms({
      page: this.currentPage(),
      perPage: this.perPage,
      search: this.search.value || undefined,
      category: cat || undefined,
    }).subscribe();
  }

  showCreateModal() {
    this.modalService.show(WorkoutProgramSettingsModal);
  }

  showViewModal(program: IWorkoutProgram) {
    // this.modalService.show(WorkoutProgramSettingsModal, { workoutProgram: program });
  }

  deleteProgram(id: number) {
    this.programService.deleteProgram(id).subscribe();
  }

  protected readonly translateProgramType = translateProgramType;
  protected readonly translateProgramCategory = translateProgramCategory;
}
