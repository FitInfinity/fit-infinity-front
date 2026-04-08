import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFound {

}
