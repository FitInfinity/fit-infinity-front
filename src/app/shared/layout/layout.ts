import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Sidebar} from './sidebar/sidebar';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {

}
