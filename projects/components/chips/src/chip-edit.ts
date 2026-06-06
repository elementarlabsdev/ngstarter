import { Directive, inject } from '@angular/core';
import { ChipRow } from './chip-row/chip-row';

@Directive({
  selector: 'ngs-chip-edit, [ngsChipEdit]',
  host: {
    'class': 'ngs-chip-edit',
    '(click)': '_handleClick($event)',
  },
})
export class ChipEdit {
  protected _parentChip = inject(ChipRow);

  _handleClick(event: Event): void {
    if (!this._parentChip.disabled() && this._parentChip.editable()) {
      this._parentChip._startEditing();
      event.stopPropagation();
    }
  }
}
