import { Directive, ElementRef } from '@angular/core';
import { CdkHeaderCell } from '@angular/cdk/table';

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'ngs-header-cell, [ngs-header-cell], th[ngs-header-cell]',
  host: {
    'class': 'ngs-header-cell',
    'role': 'columnheader',
  },
  standalone: true,
})
export class HeaderCell extends CdkHeaderCell {
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}
