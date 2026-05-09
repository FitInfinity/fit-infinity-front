import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {WorkoutSessionStatus} from '../../../shared';
import {getStatusLabel} from '../../../shared/utils';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadge {
  status = input.required<WorkoutSessionStatus>();

  label = computed(() => getStatusLabel(this.status()));
}
