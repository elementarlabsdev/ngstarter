import {
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  untracked,
  effect,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter } from '../core/datetime/date-adapter';
import { Subject } from 'rxjs';
import type { Datepicker } from '../datepicker/datepicker';
import { FormField } from '@ngstarter-ui/components/form-field';

@Directive({
  selector: 'input[ngsDatepicker]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerInput),
      multi: true,
    },
  ],
  host: {
    'class': 'ngs-datepicker-input',
    '(input)': '_onInput($any($event).target.value)',
    '(blur)': '_onTouched()',
  },
})
export class DatepickerInput<D> implements ControlValueAccessor, OnDestroy, OnInit {
  private _elementRef = inject(ElementRef);
  private _formField = inject(FormField, { optional: true });
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  readonly ngsDatepicker = input.required<Datepicker<D>>();

  _value: D | null = null;
  _onChange: (value: any) => void = () => {};
  _onTouched: () => void = () => {};

  readonly _valueChange = new Subject<D | null>();

  constructor() {
    effect(() => {
      const picker = this.ngsDatepicker();
      untracked(() => {
        if (picker) {
          picker._registerInput(this);
        }
      });
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._valueChange.complete();
  }

  writeValue(value: D | null): void {
    this._value = value;
    this._formatValue(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._elementRef.nativeElement.disabled = isDisabled;
  }

  _onInput(value: string) {
    const date = this._dateAdapter.parse(value, null);
    this._value = date;
    this._onChange(date);
    this._valueChange.next(date);
  }

  private _formatValue(value: D | null) {
    this._elementRef.nativeElement.value = (value && this._dateAdapter.isDateInstance(value) && this._dateAdapter.isValid(value))
      ? this._dateAdapter.format(value, { year: 'numeric', month: '2-digit', day: '2-digit' })
      : '';
  }

  getConnectedOverlayOrigin(): ElementRef {
    if (this._formField) {
      return this._formField.container() as ElementRef;
    }

    return this._elementRef;
  }
}
