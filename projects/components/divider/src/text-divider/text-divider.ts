import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-text-divider',
  exportAs: 'ngsTextDivider',
  templateUrl: './text-divider.html',
  styleUrl: './text-divider.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-text-divider',
  }
})
export class TextDivider {

}
