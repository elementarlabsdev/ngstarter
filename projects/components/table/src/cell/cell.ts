import { Directive, ElementRef } from '@angular/core';
import { CdkCell } from '@angular/cdk/table';

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'ngs-cell, [ngs-cell], td[ngs-cell]',
  host: {
    'class': 'ngs-cell',
    'role': 'gridcell',
  },
  standalone: true,
})
export class Cell extends CdkCell {
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}
