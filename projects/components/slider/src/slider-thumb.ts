import {
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  computed,
  numberAttribute, effect
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Slider } from './slider/slider';

@Directive({
  selector: 'input[ngsSliderThumb]',
  exportAs: 'ngsSliderThumb',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderThumb),
      multi: true,
    },
  ],
  host: {
    'class': 'ngs-slider-input',
    '[class.ngs-slider-input-active]': '_slider._activeThumb() === this',
    'type': 'range',
    '[attr.min]': 'min',
    '[attr.max]': 'max',
    '[attr.step]': 'step',
    '[value]': 'value',
    '(input)': '_onInput($event)',
    '(change)': '_onChange($event)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
  },
})
export class SliderThumb implements ControlValueAccessor, OnInit, OnDestroy {
  private _elementRef = inject(ElementRef<HTMLInputElement>);
  readonly _slider = inject(Slider);

  readonly valueChange = output<number>();

  valueInput = input(undefined, { transform: numberAttribute, alias: 'value' });

  private _value = signal(0);

  getId() {
    return 'base';
  }

  get value(): number {
    return this._value();
  }
  set value(v: number) {
    this._value.set(this._clampValue(v));
    this._updateHostValue();
    this._slider._onValueChange(this);
  }

  private _clampValue(v: number): number {
    const thumbs = this._slider._allThumbs();
    const min = this._slider.min();
    const max = this._slider.max();

    if (thumbs.length === 2) {
      const index = thumbs.indexOf(this);
      if (index === 0) {
        return Math.max(min, Math.min(v, thumbs[1].value));
      } else if (index === 1) {
        return Math.min(max, Math.max(v, thumbs[0].value));
      }
    }
    return Math.max(min, Math.min(max, v));
  }

  constructor() {
    effect(() => {
      const inputVal = this.valueInput();
      if (inputVal !== undefined && inputVal !== this.value && !this._isUserInteraction) {
        this.value = inputVal;
      }
    });
  }

  private _onChangeFn: (value: any) => void = () => {};
  private _onTouchedFn: () => void = () => {};

  ngOnInit() {
    if (this.valueInput() === undefined) {
      const initialValue = this._elementRef.nativeElement.getAttribute('value');
      if (initialValue !== null) {
        this.value = Number(initialValue);
      } else {
        this.value = this._slider.min();
      }
    } else {
      this._slider._onValueChange(this);
    }
  }

  get min(): number {
    return this._slider.min();
  }

  get max(): number {
    return this._slider.max();
  }

  get step(): number {
    return this._slider.step();
  }

  ngOnDestroy() {}

  _updateValueFromUser(value: number) {
    const clampedValue = this._clampValue(value);
    if (this._value() !== clampedValue) {
      this._isUserInteraction = true;
      this._value.set(clampedValue);
      this._updateHostValue();
      this._onChangeFn(clampedValue);
      this.valueChange.emit(clampedValue);
      this._slider._onValueChange(this);

      setTimeout(() => {
        this._isUserInteraction = false;
      });
    }
  }

  _onInput(event: Event) {
    if (this._slider._allThumbs().length > 1 && this._slider._activeThumb() !== this) {
      return;
    }
    let value = (event.target as HTMLInputElement).valueAsNumber;
    const initialValue = value;

    this._updateValueFromUser(value);

    if (value !== initialValue) {
      this._updateHostValue();
    }

    this._slider._activeThumb.set(this);
  }

  _onChange(event: Event) {
    this._onTouchedFn();
  }

  _onBlur() {
    this._onTouchedFn();
  }

  _onFocus() {
    this._slider._activeThumb.set(this);
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }

  private _isUserInteraction = false;

  writeValue(value: any): void {
    this._isUserInteraction = true;
    this.value = value;
    setTimeout(() => {
      this._isUserInteraction = false;
    });
  }

  registerOnChange(fn: any): void {
    this._onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._elementRef.nativeElement.disabled = isDisabled;
  }

  private _updateHostValue() {
    this._elementRef.nativeElement.value = (this._value() ?? 0).toString();
  }

  get percentage(): number {
    const max = this._slider.max();
    const min = this._slider.min();

    if (max === min) {
      return 0;
    }

    const p = (this._value() - min) / (max - min);
    return Math.max(0, Math.min(1, p));
  }
}
