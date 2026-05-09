import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SVG_ICONS, SvgIconName} from '../../../shared';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [],
  templateUrl: './svg-icon.html',
  styleUrl: './svg-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIcon {
  name = input.required<SvgIconName>();

  icon = computed<SafeHtml>(() => {
    return this.sanitizer.bypassSecurityTrustHtml(SVG_ICONS[this.name()]);
  });

  constructor(private readonly sanitizer: DomSanitizer) {}
}
