import { Component, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-select-body',
  exportAs: 'ngsSelectBody',
  imports: [],
  template: '<ng-content/>',
  styleUrl: './select-body.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-select-body'
  }
})
export class SelectBody {
  _elementRef = inject(ElementRef);
}
