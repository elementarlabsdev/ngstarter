import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  ElementRef,
  inject,
  booleanAttribute,
  signal,
  output,
  computed
} from '@angular/core';
import { AutoFocusDirective } from '@ngstarter/components/core';

@Component({
  selector: 'ngs-chip',
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  host: {
    'class': 'ngs-chip',
    '[class.ngs-chip-disabled]': 'disabled()',
    '[attr.appearance]': 'appearance()',
    '[attr.aria-disabled]': 'disabled()',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AutoFocusDirective
  ]
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
