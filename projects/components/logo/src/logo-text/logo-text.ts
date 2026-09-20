import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { LogoTextSize } from '../types';

@Component({
  selector: 'ngs-logo-text',
  exportAs: 'ngsLogoText',
  templateUrl: './logo-text.html',
  styleUrl: './logo-text.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-logo-text',
    '[attr.data-size]': 'size()',
  }
})
export class LogoText {
  readonly size = input<LogoTextSize>('default');
}
