import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-select-header',
  standalone: true,
  imports: [],
  template: '<ng-content />',
  styleUrl: './select-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-select-header'
  }
})
export class SelectHeader {
}
