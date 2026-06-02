import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  forwardRef,
  booleanAttribute,
  AfterContentInit,
  contentChildren,
  computed,
  signal,
  OnDestroy
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ChipOption } from '../chip-option/chip-option';

@Component({
  selector: 'ngs-chip-listbox',
  templateUrl: './chip-listbox.html',
  styleUrl: './chip-listbox.scss',
  host: {
    'class': 'ngs-chip-listbox ngs-chip-set',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple()',
    '[attr.aria-disabled]': 'isDisabled()',
  },
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipListbox),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ChipListbox implements ControlValueAccessor, AfterContentInit, OnDestroy {
  multiple = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  private readonly _disabledByControl = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this._disabledByControl());

  readonly _chips = contentChildren(ChipOption, { descendants: true });
  private readonly _chips$ = toObservable(this._chips);
  private _chipSelectionSubscriptions: Array<{ unsubscribe(): void }> = [];
  private _syncTimeout: ReturnType<typeof setTimeout> | null = null;

  private _value: any;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
    this._syncChipsAsync();
  }

  writeValue(value: any): void {
    this._value = value;
    this._syncChipsAsync();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByControl.set(isDisabled);
  }

  ngAfterContentInit() {
    this._chips$.subscribe(() => {
      this._syncChipsAsync();
    });

    if (this._value === undefined) {
      const selectedChips = this._chips().filter(chip => chip.isSelected);

      if (this.multiple()) {
        this._value = selectedChips.map(chip => chip.value() !== undefined ? chip.value() : chip);
      } else {
        const lastSelected = selectedChips[selectedChips.length - 1];
        this._value = lastSelected ? (lastSelected.value() !== undefined ? lastSelected.value() : lastSelected) : undefined;
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
    if (this.isDisabled()) {
      this._updateChips();
      return;
    }

    const value = chip.value() !== undefined ? chip.value() : chip;

    if (this.multiple()) {
      if (!Array.isArray(this._value)) {
        this._value = [];
      }
      const index = this._value.indexOf(value);
      if (chip.isSelected) {
        if (index < 0) {
          this._value.push(value);
        }
      } else {
        if (index >= 0) {
          this._value.splice(index, 1);
        }
      }
      this._value = [...this._value];
    } else {
      this._chips().forEach(c => {
        if (c !== chip) {
          c._setSelected(false);
        }
      });
      this._value = chip.isSelected ? value : null;
    }
    this.onChange(this._value);
    this.onTouched();
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
    if (!_chips || this._value === undefined) {
      return;
    }

    _chips.forEach(chip => {
      const value = chip.value() !== undefined ? chip.value() : chip;

      if (this.multiple()) {
        chip._setSelected(Array.isArray(this._value) && this._value.includes(value));
      } else {
        chip._setSelected(this._value === value);
      }
    });
  }
}
