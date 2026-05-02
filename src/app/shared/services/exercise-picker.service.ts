import {Injectable, signal} from '@angular/core';
import {IWorkoutExercise} from '../../interfaces/workout-exercise.interface';

@Injectable({ providedIn: 'root' })
export class ExercisePickerService {
  picked = signal<IWorkoutExercise[]>([]);
}
