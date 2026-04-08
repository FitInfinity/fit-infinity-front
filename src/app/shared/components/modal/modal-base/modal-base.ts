import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-modal-base',
  imports: [],
  templateUrl: './modal-base.html',
  styleUrl: './modal-base.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ModalBase {

}
