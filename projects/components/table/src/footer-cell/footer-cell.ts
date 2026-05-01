import { Directive, ElementRef } from '@angular/core';
import { CdkFooterCell } from '@angular/cdk/table';

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'ngs-footer-cell, [ngs-footer-cell], td[ngs-footer-cell]',
  host: {
    'class': 'ngs-footer-cell',
    'role': 'gridcell',
  },
  standalone: true,
})
export class FooterCell extends CdkFooterCell {
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}
