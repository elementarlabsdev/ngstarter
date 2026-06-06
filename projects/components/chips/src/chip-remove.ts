import { Directive, inject } from '@angular/core';
import { Chip } from './chip/chip';

@Directive({
  selector: 'ngs-chip-remove, [ngsChipRemove]',
  host: {
    'class': 'ngs-chip-remove',
    '(click)': '_handleClick($event)',
  },
})
export class ChipRemove {
  protected _parentChip = inject(Chip);

  _handleClick(event: Event): void {
    if (!this._parentChip.disabled()) {
      this._parentChip.remove();
      event.stopPropagation();
    }
  }
}
