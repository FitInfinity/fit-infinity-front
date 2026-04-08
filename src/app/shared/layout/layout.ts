import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Sidebar} from './sidebar/sidebar';
import {RouterOutlet} from '@angular/router';
import {ModalHost} from '../components/modal/modal-host/modal-host';

@Component({
  selector: 'app-layout',
  imports: [
    Sidebar,
    RouterOutlet,
    ModalHost
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {

}
