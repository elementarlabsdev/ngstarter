import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsSegmentedIcon]',
  exportAs: 'ngsSegmentedIcon',
  host: {
    'class': 'ngs-segmented-icon'
  }
})
export class SegmentedIconDirective {
}
