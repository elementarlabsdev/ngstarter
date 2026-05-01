import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  booleanAttribute,
  forwardRef,
  viewChild,
  ElementRef,
  ChangeDetectorRef,
  inject,
  PLATFORM_ID, signal,
  output
} from '@angular/core';
import { Chip } from '../chip/chip';
import { isPlatformBrowser } from '@angular/common';
import { AutoFocusDirective } from '@ngstarter/components/core';

export interface ChipEditedEvent {
  /** The chip row that was edited. */
  chip: ChipRow;

  /** The value of the chip row after it was edited. */
  value: string;
}

@Component({
  selector: 'ngs-chip-row',
  templateUrl: '../chip/chip.html',
  styleUrl: '../chip/chip.scss',
  host: {
    'class': 'ngs-chip ngs-chip-row',
    '[class.ngs-chip-disabled]': 'disabled()',
    '[class.ngs-chip-editing]': '_editing',
    '[class.ngs-chip-editable]': 'editable()',
    '[class.ngs-chip-filled]': 'appearance() === "filled"',
    '[class.ngs-chip-outlined]': 'appearance() === "outlined"',
    '[attr.aria-disabled]': 'disabled()',
    'role': 'row',
    '(keydown)': '_handleKeydown($event)',
    '(click)': '_handleClick($event)',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    AutoFocusDirective
  ],
  providers: [
    {
      provide: Chip,
      useExisting: forwardRef(() => ChipRow)
    }
  ]
})
export class ChipRow extends Chip {
  private _changeDetectorRef = inject(ChangeDetectorRef);

  private readonly _editInput = viewChild<ElementRef<HTMLSpanElement>>('editInput');

  alreadyEdited = signal(false);

  editable = input(false, { transform: booleanAttribute });

  readonly edited = output<ChipEditedEvent>();

  /**
   * Allows for use of the template-bound $event object
   */
  override _handleKeydown(event: KeyboardEvent): void {
    if (this.editable() && !this.disabled()) {
      if (this._editing) {
        if (event.key === 'Enter') {
          this._stopEditing();
          event.preventDefault();
        } else if (event.key === 'Escape') {
          this._editing = false;
          this._changeDetectorRef.markForCheck();
          event.preventDefault();
        }
      }
    }
  }

  override _handleBlur(): void {
    if (this._editing) {
      this._stopEditing();
    }
  }

  _handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      if (this.editable() && !this._editing && this.alreadyEdited()) {
        this._startEditing();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  _startEditing(): void {
    if (this.editable() && !this.disabled() && !this._editing) {
      this.alreadyEdited.set(true);
      this._editing = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _stopEditing(): void {
    if (this._editing) {
      this._editing = false;
      const newValue = this._editInput()!.nativeElement.innerText.trim();
      this.edited.emit({ chip: this, value: newValue });
      this._changeDetectorRef.markForCheck();
    }
  }
}
