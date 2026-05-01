import { Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'ngs-select-body',
  exportAs: 'ngsSelectBody',
  imports: [],
  template: '<ng-content/>',
  styleUrl: './select-body.scss',
  host: {
    'class': 'ngs-select-body'
  }
})
export class SelectBody {
  _elementRef = inject(ElementRef);
}
