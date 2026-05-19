import { Directive } from '@angular/core';

@Directive({
  selector: 'ngs-chip-shape, [ngsChipShape]',
  exportAs: 'ngsChipShape',
  host: {
    'class': 'ngs-chip-shape',
  },
})
export class ChipShape {}
