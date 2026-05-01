import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  Optional,
  Self,
  LOCALE_ID,
  input,
  booleanAttribute,
  computed,
  signal,
  Signal,
  forwardRef,
  effect,
  untracked,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Timepicker } from '../timepicker/timepicker';
import { FormField } from '@ngstarter/components/form-field';

@Directive({
  selector: 'input[ngsTimepicker]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimepickerInput),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TimepickerInput),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-timepicker-input',
    '[disabled]': 'disabled() || null',
    '(input)': '_onInput($any($event.target).value)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
    '(click)': '_onClick()',
  }
})
export class TimepickerInput<D = any> implements ControlValueAccessor, OnDestroy, Validator {
  private _elementRef = inject(ElementRef<HTMLInputElement>);
  private _formField = inject(FormField, { optional: true });
  private _localeId = inject(LOCALE_ID);

  private _disabledByCva = signal(false);
  protected _disabledInput = input<boolean, unknown>(false, {
    alias: 'disabled',
    transform: booleanAttribute
  });
  readonly disabled: Signal<boolean> = computed(() => this._disabledInput() || this._disabledByCva());
  readonly max = input<D | null, unknown>(null, {
    transform: (value: unknown) => value as D | null
  });
  readonly min = input<D | null, unknown>(null, {
    transform: (value: unknown) => value as D | null
  });
  readonly openOnClick = input<boolean, unknown>(true, {
    transform: booleanAttribute
  });

  readonly ngsTimepicker = input.required<Timepicker>();
  private _timepicker: Timepicker;

  private _onChange: (value: any) => void = () => {};
  private _onTouched: () => void = () => {};
  private _validatorOnChange: () => void = () => {};

  private _modelValue: string = '';
  private _destroyed = new Subject<void>();
  private _timepickerDestroyed = new Subject<void>();
  private _isTimepickerOpen = false;
  private _lastExternalDate: Date | null = null;

  constructor() {
    effect(() => {
      this.min();
      this.max();
      this._validatorOnChange();
    });

    effect(() => {
      const picker = this.ngsTimepicker();
      untracked(() => {
        this._registerTimepicker(picker);
      });
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _registerTimepicker(value: Timepicker) {
    if (value && value !== this._timepicker) {
      this._timepickerDestroyed.next();
      this._timepicker = value;
      this._timepicker._registerInput(this);
      this._timepicker.opened
        .pipe(takeUntil(this._timepickerDestroyed), takeUntil(this._destroyed))
        .subscribe(() => {
          this._isTimepickerOpen = true;
        });
      this._timepicker.closed
        .pipe(takeUntil(this._timepickerDestroyed), takeUntil(this._destroyed))
        .subscribe(() => {
          this._isTimepickerOpen = false;
          this._validatorOnChange();
          this._updateNativeValidity(this._doValidate(this._modelValue));
        });
    }
  }

  writeValue(value: any): void {
    this._modelValue = this._toTimeString(value);
    this._lastExternalDate = value instanceof Date ? value : null;
    this._elementRef.nativeElement.value = this._formatValue(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this._isTimepickerOpen) {
      return null;
    }

    const value = control.value;
    const errors = this._doValidate(value);
    this._updateNativeValidity(errors);
    return errors;
  }

  private _doValidate(value: any): ValidationErrors | null {
    if (!value) {
      return null;
    }

    const parsedValue = this._parseValue(value);
    const isValid = /^\d{2}:\d{2}$/.test(parsedValue);

    if (!isValid) {
      return { 'ngsTimepickerParse': { text: value } };
    }

    const min = this.min();

    if (min) {
      const minTime = this._toTimeString(min);

      if (parsedValue < minTime) {
        return { 'ngsTimepickerMin': { min: minTime, actual: parsedValue } };
      }
    }

    const max = this.max();

    if (max) {
      const maxTime = this._toTimeString(max);

      if (parsedValue > maxTime) {
        return { 'ngsTimepickerMax': { max: maxTime, actual: parsedValue } };
      }
    }

    return null;
  }

  private _updateNativeValidity(errors: ValidationErrors | null): void {
    const element = this._elementRef.nativeElement;

    if (typeof element.setCustomValidity !== 'function') {
      return;
    }

    if (!errors) {
      element.setCustomValidity('');
    } else {
      const errorKey = Object.keys(errors)[0];
      element.setCustomValidity(errorKey);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  _onInput(value: string) {
    this._modelValue = this._parseValue(value);

    const originalValue = (this._lastExternalDate && /^\d{2}:\d{2}$/.test(this._modelValue))
      ? this._mergeTimeIntoDate(this._modelValue, this._lastExternalDate)
      : this._modelValue;

    this._onChange(originalValue);
    this._formField?.control()?.stateChanges.set(undefined);

    if (!this._isTimepickerOpen) {
      this._updateNativeValidity(this._doValidate(this._modelValue));
    }
  }

  _onBlur() {
    this._onTouched();
    // After blur, re-format the input field to a clean localized string if it's a valid time
    this._elementRef.nativeElement.value = this._formatValue(this._modelValue);
  }

  private _toTimeString(value: any): string {
    if (value instanceof Date) {
      return value.getHours().toString().padStart(2, '0') + ':' +
        value.getMinutes().toString().padStart(2, '0');
    }

    if (typeof value === 'string') {
      if (!/^\d{2}:\d{2}$/.test(value)) {
        return this._parseValue(value);
      }
    }

    return value || '';
  }

  _onFocus() {
    if (this.openOnClick()) {
      this.ngsTimepicker().open();
    }
  }

  _onClick() {
    if (this.openOnClick()) {
      this.ngsTimepicker().open();
    }
  }

  _setValue(value: string) {
    const originalValue = (this._lastExternalDate)
      ? this._mergeTimeIntoDate(value, this._lastExternalDate)
      : value;

    this._modelValue = value;
    this._elementRef.nativeElement.value = this._formatValue(value);
    this._onChange(originalValue);
    this._formField?.control()?.stateChanges.set(undefined);

    if (!this._isTimepickerOpen) {
      this._updateNativeValidity(this._doValidate(value));
    }
    this._elementRef.nativeElement.focus();
  }

  private _mergeTimeIntoDate(time: string, date: Date): Date {
    const [h, m] = time.split(':').map(v => parseInt(v, 10));
    const newDate = new Date(date);
    newDate.setHours(h, m, 0, 0);
    return newDate;
  }

  private _formatValue(value: any): string {
    if (value instanceof Date) {
      return formatDate(value, 'shortTime', this._localeId);
    }

    if (typeof value !== 'string' || !value || !value.includes(':')) {
      return value || '';
    }

    const [h, m] = value.split(':');
    const date = new Date();
    date.setHours(+h, +m, 0, 0);
    return formatDate(date, 'shortTime', this._localeId);
  }

  _parseValue(value: any): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.getHours().toString().padStart(2, '0') + ':' +
        value.getMinutes().toString().padStart(2, '0');
    }

    if (typeof value !== 'string') {
      return '';
    }

    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(':');
      return h.padStart(2, '0') + ':' + m.padStart(2, '0');
    }

    if (/^\d{1,2}$/.test(value)) {
      return value;
    }

    let tryValue = value;

    if (/^\d{1,2}\s?(am|pm)$/i.test(value)) {
      tryValue = value.replace(/(am|pm)/i, ':00 $1');
    }

    const date = new Date('1970-01-01 ' + tryValue);

    if (!isNaN(date.getTime())) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }

    return value;
  }

  get value(): string {
    return this._modelValue;
  }

  getConnectedOverlayOrigin(): ElementRef {
    if (this._formField) {
      return this._formField.wrapper();
    }

    return this._elementRef;
  }

  getOverlayWidth(): string | number {
    if (this._formField) {
      return this._formField.wrapper().nativeElement.getBoundingClientRect().width;
    }

    return 'auto';
  }
}
