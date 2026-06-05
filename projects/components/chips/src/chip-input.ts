import {
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  DoCheck,
  output
} from '@angular/core';
import { ChipGrid } from './chip-grid/chip-grid';

export interface ChipInputEvent {
  readonly chipInput: ChipInput;
  readonly value: string;
  readonly input: HTMLInputElement;
}

@Directive({
  selector: 'input[ngsChipInputFor]',
  host: {
    'class': 'ngs-chip-input',
    '(input)': '_onInput()',
    '(keydown)': '_onKeydown($event)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
  }
})
export class ChipInput implements DoCheck {
  private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  set chipGrid(value: ChipGrid) {
    this._chipGrid = value;
    this._chipGrid?._registerInput(this);
    this._chipGrid?._setInputEmpty(!this._elementRef.nativeElement.value);
  }
  get chipGrid() {
    return this._chipGrid;
  }
  private _chipGrid: ChipGrid;

  chipGridInput = input<ChipGrid | undefined>(undefined, { alias: 'ngsChipInputFor' });

  chipInputSeparatorKeyCodes = input<readonly number[] | ReadonlySet<number>>(undefined, { alias: 'ngsChipInputSeparatorKeyCodes' });

  chipInputAddOnBlur = input(false, { alias: 'ngsChipInputAddOnBlur', transform: booleanAttribute });

  readonly chipInputTokenEnd = output<ChipInputEvent>();

  protected readonly _value = signal('');
  protected readonly _focused = signal(false);

  constructor() { }

  ngDoCheck() {
    if (this.chipGridInput() && this.chipGridInput() !== this._chipGrid) {
      this.chipGrid = this.chipGridInput()!;
    }
    if (this._value() !== this._elementRef.nativeElement.value) {
      this._onInput();
    }
  }

  _onInput() {
    const value = this._elementRef.nativeElement.value;
    this._value.set(value);
    this.chipGrid?._setInputEmpty(!value);
  }

  _onKeydown(event: any) {
    if (event.defaultPrevented) {
      return;
    }
    const separatorKeyCodes = this.chipInputSeparatorKeyCodes();
    const isSeparatorKey = Array.isArray(separatorKeyCodes)
      ? separatorKeyCodes.includes(event.keyCode)
      : !!separatorKeyCodes && 'has' in separatorKeyCodes && separatorKeyCodes.has(event.keyCode);

    if (isSeparatorKey) {
      this.chipInputTokenEnd.emit({
        chipInput: this,
        value: this._elementRef.nativeElement.value,
        input: this._elementRef.nativeElement
      });
      event.preventDefault();
    }
  }

  _onBlur() {
    this._focused.set(false);
    if (this.chipInputAddOnBlur()) {
      this.chipInputTokenEnd.emit({
        chipInput: this,
        value: this._elementRef.nativeElement.value,
        input: this._elementRef.nativeElement
      });
    }
    this.chipGrid?._setInputFocused(false);
  }

  _onFocus() {
    this._focused.set(true);
    this.chipGrid?._setInputFocused(true);
  }

  clear() {
    this._elementRef.nativeElement.value = '';
    this._value.set('');
    this.chipGrid?._setInputEmpty(true);
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
