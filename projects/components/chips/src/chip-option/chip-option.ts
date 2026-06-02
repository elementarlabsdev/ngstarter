import {
  Component,
  ChangeDetectionStrategy,
  input,
  booleanAttribute,
  forwardRef,
  output,
  effect
} from '@angular/core';
import { AutoFocusDirective } from '@ngstarter-ui/components/core';
import { Chip } from '../chip/chip';

@Component({
  selector: 'ngs-chip-option',
  exportAs: 'ngsChipOption',
  imports: [
    AutoFocusDirective
  ],
  templateUrl: '../chip/chip.html',
  styleUrl: '../chip/chip.scss',
  providers: [
    {
      provide: Chip,
      useExisting: forwardRef(() => ChipOption)
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-chip ngs-chip-option',
    '[class.ngs-chip-selected]': 'isSelected',
    '[class.ngs-chip-disabled]': 'disabled()',
    '[class.ngs-chip-filled]': 'appearance() === "filled"',
    '[class.ngs-chip-outlined]': 'appearance() === "outlined"',
    '[attr.aria-selected]': 'isSelected',
    '[attr.aria-disabled]': 'disabled()',
    '(click)': 'toggleSelected()',
  },
})
export class ChipOption extends Chip {
  selected = input(false, { transform: booleanAttribute });
  private _internalSelected = false;

  constructor() {
    super();
    effect(() => {
      this._setSelected(this.selected());
    });
  }

  get isSelected(): boolean {
    return this._internalSelected;
  }
  _setSelected(value: boolean) {
    this._internalSelected = value;
  }

  readonly selectionChange = output<{
    source: ChipOption;
    selected: boolean;
  }>();

  toggleSelected(): void {
    if (!this.disabled()) {
      this._setSelected(!this.isSelected);
      this.selectionChange.emit({ source: this, selected: this.isSelected });
    }
  }
}
