import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {ButtonSize, ButtonVariant} from './simple-button.types';

@Component({
  selector: 'app-simple-button',
  standalone: true,
  imports: [],
  templateUrl: './simple-button.html',
  styleUrl: './simple-button.scss',
  host: {
    '[class.full-width-mobile]': 'fullWidthMobile()',
    '[class.full-width-always]': 'fullWidthAlways()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleButton {
  text = input.required<string>();
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidthMobile = input<boolean>(false);
  fullWidthAlways = input<boolean>(false);

  actionClick = output<string>();
}
