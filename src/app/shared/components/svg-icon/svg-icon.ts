import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'svg[icon]',
  imports: [],
  template: '<svg:use [attr.href]="href"></svg:use>',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIcon {
  icon = input<string>('')

  get href(): string {
    return `/assets/svg/sprite.svg#${this.icon()}`;
  }
}
