import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-select-footer',
  standalone: true,
  imports: [],
  template: '<ng-content />',
  styleUrl: './select-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-select-footer'
  }
})
export class SelectFooter {
}
