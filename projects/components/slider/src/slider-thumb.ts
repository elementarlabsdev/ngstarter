import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  computed,
  model,
  booleanAttribute,
  effect
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { connectLegacyNativeFormControl } from '@ngstarter-ui/components/core';
import { Slider } from './slider/slider';

@Directive({
  selector: 'input[ngsSliderThumb]',
  exportAs: 'ngsSliderThumb',
  host: {
    'class': 'ngs-slider-input',
    '[class.ngs-slider-input-active]': '_slider._activeThumb() === this',
    'type': 'range',
    '[attr.min]': 'minimum',
    '[attr.max]': 'maximum',
    '[attr.step]': 'step',
    '[value]': 'renderedValue',
    '[disabled]': 'disabled() || legacyDisabled() || _slider.disabled()',
    '[attr.aria-readonly]': 'readonly() || null',
    '(input)': '_onInput($event)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
  },
})
export class SliderThumb implements FormValueControl<number>, OnInit {
  private _elementRef = inject(ElementRef<HTMLInputElement>);
  readonly _slider = inject(Slider);

  readonly value = model(this._slider.min());
  readonly touch = output<void>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly legacyDisabled = signal(false);
  private readonly _value = signal(0);

  getId() {
    return 'base';
  }

  get renderedValue(): number {
    return this._value();
  }

  private _clampValue(v: number): number {
    const thumbs = this._slider._allThumbs();
    const min = this._slider.min();
    const max = this._slider.max();

    if (thumbs.length === 2) {
      const index = thumbs.indexOf(this);
      if (index === 0) {
        return Math.max(min, Math.min(v, thumbs[1].renderedValue));
      } else if (index === 1) {
        return Math.min(max, Math.max(v, thumbs[0].renderedValue));
      }
    }
    return Math.max(min, Math.min(max, v));
  }

  constructor() {
    connectLegacyNativeFormControl(this.value, this.touch, value => this.value.set(value), this.legacyDisabled.set);
    effect(() => {
      const value = this.value() ?? this._slider.min();
      this._value.set(this._clampValue(Number(value)));
    });
  }

  ngOnInit(): void {
    this._value.set(this._clampValue(Number(this.value() ?? this._slider.min())));
    this._slider._onValueChange(this);
  }

  get minimum(): number {
    return this._slider.min();
  }

  get maximum(): number {
    return this._slider.max();
  }

  get step(): number {
    return this._slider.step();
  }

  _updateValueFromUser(value: number): void {
    if (this.disabled() || this.legacyDisabled() || this.readonly() || this._slider.disabled()) return;
    const clampedValue = this._clampValue(value);
    if (this._value() !== clampedValue) {
      this._value.set(clampedValue);
      this.value.set(clampedValue);
      this._slider._onValueChange(this);
    }
  }

  _onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this._slider._allThumbs().length < 2 || this._slider._activeThumb() === this) {
      this._updateValueFromUser(input.valueAsNumber);
      this._slider._activeThumb.set(this);
    }
    input.valueAsNumber = this.renderedValue;
  }

  _onBlur(): void {
    this.touch.emit();
  }

  _onFocus() {
    this._slider._activeThumb.set(this);
  }

  focus() {
    this._elementRef.nativeElement.focus();
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
