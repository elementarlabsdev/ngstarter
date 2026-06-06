import {
  Component,
  ChangeDetectionStrategy,
  input,
  ElementRef,
  inject,
  booleanAttribute,
  output,
} from '@angular/core';
import { AutoFocusDirective } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-chip',
  exportAs: 'ngsChip',
  imports: [
    AutoFocusDirective
  ],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-chip',
    '[class.ngs-chip-disabled]': 'disabled()',
    '[attr.appearance]': 'appearance()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class Chip {
  readonly _elementRef = inject(ElementRef);
  protected _editing = false;

  appearance = input<string>('filled');
  disabled = input(false, { transform: booleanAttribute });
  value = input<any>(undefined);

  readonly destroyed = output<{ chip: Chip; }>();
  readonly removed = output<{ chip: Chip; }>();

  remove(): void {
    if (!this.disabled()) {
      this.removed.emit({ chip: this });
    }
  }

  ngOnDestroy() {
    this.destroyed.emit({ chip: this });
  }

  _handleKeydown(event: KeyboardEvent): void {
  }

  _handleBlur(): void {
  }
}
