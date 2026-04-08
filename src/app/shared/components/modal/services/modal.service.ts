import {Injectable, Type, ViewContainerRef} from '@angular/core';
import {finalize, Observable, of, take} from 'rxjs';
import {outputToObservable} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private containerRef!: ViewContainerRef;

  registerContainer(viewRef: ViewContainerRef) {
    this.containerRef = viewRef;
  }

  show<T>(component: Type<T>, props?: Record<string, any>): Observable<boolean> {
    if (!this.containerRef) return of(false);

    const componentRef = this.containerRef.createComponent(component);
    const instance: any = componentRef.instance;

    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        componentRef.setInput(key as any, value);
      });

      return of(true);
    }

    if (!instance.result) return of(false);

    return outputToObservable<boolean>(instance.result).pipe(
      take(1),
      finalize(() => {
        const index = this.containerRef.indexOf(componentRef.hostView);
        if (index !== -1) {
          this.containerRef.remove(index);
        }
      })
    );
  }

  hide() {
    if (!this.containerRef) return;

    this.containerRef.clear();
  }
}
