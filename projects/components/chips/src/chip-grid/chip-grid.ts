import {
  ChangeDetectionStrategy,
  forwardRef,
  booleanAttribute,
  Component,
  AfterContentInit,
  computed,
  signal,
  input,
  inject,
  ElementRef,
  contentChildren,
  output
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { ChipRow } from '../chip-row/chip-row';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';

let nextId = 0;

@Component({
  selector: 'ngs-chip-grid',
  templateUrl: './chip-grid.html',
  styleUrl: './chip-grid.scss',
  host: {
    'class': 'ngs-chip-grid ngs-chip-set',
    'role': 'grid',
    '[attr.aria-disabled]': 'disabled',
    '[id]': 'id',
  },
  standalone: true,
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => ChipGrid),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipGrid implements ControlValueAccessor, AfterContentInit, FormFieldControl<any[]> {
  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly _elementRef = inject(ElementRef);

  _id = input<string>(`ngs-chip-grid-${nextId++}`, { alias: 'id' });
  get id(): string { return this._id(); }
  _placeholder = input<string | undefined>(undefined, { alias: 'placeholder' });
  get placeholder(): string | undefined { return this._placeholder(); }
  _required = input(false, { transform: booleanAttribute, alias: 'required' });
  get required(): boolean { return this._required(); }
  private _disabled = signal(false);
  _disabledInput = input(false, {
    transform: booleanAttribute,
    alias: 'disabled'
  });
  isDisabled = computed(() => this._disabledInput() || this._disabled());
  get disabled(): boolean { return this.isDisabled(); }

  readonly _chips = contentChildren(ChipRow, { descendants: true });
  private readonly _chips$ = toObservable(this._chips);

  readonly valueChange = output<any>();

  private _value = signal<any[]>([]);
  readonly stateChanges = signal<void>(undefined);
  private _focused = signal(false);
  get focused(): boolean { return this._focused(); }
  get multiline(): boolean { return this._chipsLength() > 0; }
  private _errorState = signal(false);
  get errorState(): boolean { return this._errorState(); }

  private _chipsLength = signal(0);
  get chipsLength(): number { return this._chipsLength(); }

  private _empty = computed(() => {
    const value = this._value();
    return (!value || value.length === 0) &&
      this._chipsLength() === 0 &&
      !this._isInputFocused() &&
      this._isInputEmpty();
  });
  get empty(): boolean { return this._empty(); }

  private _shouldLabelFloat = computed(() => {
    return !this.empty || this.focused;
  });
  get shouldLabelFloat(): boolean { return this._shouldLabelFloat(); }

  private _isInputFocused = signal(false);
  private _isInputEmpty = signal(true);
  private _chipInput: any;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get value(): any[] {
    return this._value();
  }

  set value(value: any[]) {
    this._value.set(value);
    this.onChange(value);
    this.stateChanges.set(undefined);
  }

  writeValue(value: any): void {
    this._value.set(value || []);
    this.stateChanges.set(undefined);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
    this.stateChanges.set(undefined);
  }

  ngAfterContentInit() {
    this._chips$.subscribe(() => {
      this._chipsLength.set(this._chips().length);
      this.stateChanges.set(undefined);
    });
    this._chipsLength.set(this._chips().length);
  }

  _setFocused(focused: boolean) {
    if (focused !== this._focused()) {
      this._focused.set(focused);
      this.stateChanges.set(undefined);
    }
  }

  _setInputFocused(focused: boolean) {
    this._isInputFocused.set(focused);
    this._setFocused(focused);
  }

  _setInputEmpty(empty: boolean) {
    this._isInputEmpty.set(empty);
    this.stateChanges.set(undefined);
  }

  _registerInput(input: any) {
    this._chipInput = input;
  }

  focus(): void {
    if (this.isDisabled()) {
      return;
    }

    if (this._chipInput) {
      this._chipInput.focus();
    } else {
      this._elementRef.nativeElement.focus();
    }
  }
}
