import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[ngsChipControl]',
  host: {
    'class': 'ngs-chip-control',
  }
})
export class ChipControl {
}
