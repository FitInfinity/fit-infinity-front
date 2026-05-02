import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalBase } from '../../../../shared/components/modal/modal-base/modal-base';
import { SvgIcon } from '../../../../shared/components/svg-icon/svg-icon';
import { ModalService } from '../../../../shared/components/modal/services/modal.service';
import { WorkoutProgramService } from '../../../../shared/services/workout-program.service';
import { WorkoutSessionService } from '../../../../shared/services/workout-session.service';

@Component({
  selector: 'app-workout-session-create-modal',
  imports: [ReactiveFormsModule, ModalBase, SvgIcon],
  templateUrl: './workout-session-create-modal.html',
  styleUrl: './workout-session-create-modal.scss',
})
export class WorkoutSessionCreateModal implements OnInit {
  private modalService = inject(ModalService);
  private programService = inject(WorkoutProgramService);
  private workoutSessionService = inject(WorkoutSessionService);

  selectedDate: InputSignal<string> = input<string>('');
  programs = this.programService.programs;
  isSaving = signal(false);
  error = signal('');

  form = new FormGroup({
    date: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    workoutProgramId: new FormControl<number | null>(null),
    notes: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.patchValue({ date: this.selectedDate() });

    if (!this.programs().length) {
      this.programService.getPrograms({ perPage: 100 }).subscribe();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, workoutProgramId, notes } = this.form.getRawValue();
    this.isSaving.set(true);
    this.error.set('');

    this.workoutSessionService.createSession({
      date,
      workoutProgramId,
      notes: notes || null,
    }).subscribe({
      next: () => this.modalService.hide(),
      error: () => {
        this.error.set('Не удалось запланировать тренировку');
        this.isSaving.set(false);
      },
    });
  }

  onClose(): void {
    this.modalService.hide();
  }
}
