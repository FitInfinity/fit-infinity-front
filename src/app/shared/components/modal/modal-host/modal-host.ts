import {AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild, ViewContainerRef} from '@angular/core';
import {ModalService} from '../services/modal.service';

@Component({
  selector: 'app-modal-host',
  imports: [],
  templateUrl: './modal-host.html',
  styleUrl: './modal-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ModalHost implements AfterViewInit {
  private modalService = inject(ModalService);

  container = viewChild('container', { read: ViewContainerRef });

  ngAfterViewInit() {
    const container = this.container();

    if (!container) return;
    this.modalService.registerContainer(container);
  }
}
