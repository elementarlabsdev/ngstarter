import {
  Component,
  ChangeDetectionStrategy,
  input,
  booleanAttribute,
  AfterContentInit,
  contentChildren,
  model,
  output,
  effect,
  OnDestroy
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormValueControl } from '@angular/forms/signals';
import { ChipOption } from '../chip-option/chip-option';

@Component({
  selector: 'ngs-chip-listbox',
  templateUrl: './chip-listbox.html',
  styleUrl: './chip-listbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-chip-listbox ngs-chip-set',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple()',
    '[attr.aria-disabled]': 'isDisabled()',
  },
})
export class ChipListbox implements FormValueControl<any>, AfterContentInit, OnDestroy {
  multiple = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  readonly isDisabled = this.disabled;
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly value = model<any>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  readonly _chips = contentChildren(ChipOption, { descendants: true });
  private readonly _chips$ = toObservable(this._chips);
  private _chipSelectionSubscriptions: Array<{ unsubscribe(): void }> = [];
  private _syncTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.value();
      this._syncChipsAsync();
    });
  }

  ngAfterContentInit() {
    this._chips$.subscribe(() => {
      this._syncChipsAsync();
    });

    if (this.value() === undefined) {
      const selectedChips = this._chips().filter(chip => chip.isSelected);

      if (this.multiple()) {
        this.value.set(selectedChips.map(chip => chip.value() !== undefined ? chip.value() : chip));
      } else {
        const lastSelected = selectedChips[selectedChips.length - 1];
        this.value.set(lastSelected ? (lastSelected.value() !== undefined ? lastSelected.value() : lastSelected) : undefined);
      }
    }

    this._syncChipsAsync();
  }

  ngOnDestroy(): void {
    if (this._syncTimeout !== null) {
      clearTimeout(this._syncTimeout);
      this._syncTimeout = null;
    }

    this._clearChipSelectionSubscriptions();
  }

  private _onSelectionChange(chip: ChipOption): void {
    if (this.isDisabled() || this.readonly()) {
      this._updateChips();
      return;
    }

    const value = chip.value() !== undefined ? chip.value() : chip;

    if (this.multiple()) {
      const selected = Array.isArray(this.value()) ? this.value() : [];
      this.value.set(chip.isSelected
        ? selected.includes(value) ? selected : [...selected, value]
        : selected.filter((item: unknown) => item !== value));
    } else {
      this._chips().forEach(c => {
        if (c !== chip) {
          c._setSelected(false);
        }
      });
      this.value.set(chip.isSelected ? value : null);
    }
  }

  private _watchChips(): void {
    this._clearChipSelectionSubscriptions();

    this._chipSelectionSubscriptions = this._chips().map(chip =>
      chip.selectionChange.subscribe(() => {
        this._onSelectionChange(chip);
      })
    );
  }

  private _clearChipSelectionSubscriptions(): void {
    this._chipSelectionSubscriptions.forEach(subscription => subscription.unsubscribe());
    this._chipSelectionSubscriptions = [];
  }

  private _syncChipsAsync(): void {
    if (this._syncTimeout !== null) {
      clearTimeout(this._syncTimeout);
    }

    this._syncTimeout = setTimeout(() => {
      this._syncTimeout = null;
      this._watchChips();
      this._updateChips();
    });
  }

  private _updateChips(): void {
    const _chips = this._chips();
    if (!_chips || this.value() === undefined) {
      return;
    }

    _chips.forEach(chip => {
      const value = chip.value() !== undefined ? chip.value() : chip;

      if (this.multiple()) {
        chip._setSelected(Array.isArray(this.value()) && this.value().includes(value));
      } else {
        chip._setSelected(this.value() === value);
      }
    });
  }
}
