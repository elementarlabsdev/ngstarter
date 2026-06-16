import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  booleanAttribute,
  model,
  effect,
  contentChildren
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioButton } from '../radio-button/radio-button';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'ngs-radio-group',
  exportAs: 'ngsRadioGroup',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroup),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-radio-group',
    '[attr.role]': '"radiogroup"',
    '[attr.aria-disabled]': 'disabled()',
    '[class.ngs-radio-group-horizontal]': 'orientation() === "horizontal"',
    '[class.ngs-radio-group-vertical]': 'orientation() === "vertical"',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroup implements ControlValueAccessor, AfterContentInit {
  readonly _radios = contentChildren(forwardRef(() => RadioButton), { descendants: true });

  disabled = model(false);

  name = input<string>();
  orientation = input<RadioGroupOrientation>('horizontal');
  value = model<any>();

  readonly change = output<any>();

  constructor() {
    effect(() => {
      this._markRadiosForCheck();
    });
    effect(() => {
      this._updateSelectedRadioFromValue();
      this._onChange(this.value());
    });
  }

  _onChange: (value: any) => void = () => {};
  _onTouched: () => void = () => {};

  ngAfterContentInit() {
    this._updateSelectedRadioFromValue();
  }

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  _emitChangeEvent(value: any): void {
    this._onChange(value);
    this.change.emit({ source: this, value });
  }

  private _updateSelectedRadioFromValue() {
    const _radios = this._radios();
    if (_radios) {
      _radios.forEach(radio => {
        radio.checked.set(this.value() === radio.value());
      });
    }
  }

  private _markRadiosForCheck() {
    const _radios = this._radios();
    if (_radios) {
      _radios.forEach(radio => radio._markForCheck());
    }
  }

  _onRadioClick(radio: RadioButton) {
    if (this.disabled() || radio.disabled()) {
      return;
    }

    if (this.value() !== radio.value()) {
      this.value.set(radio.value());
      this._emitChangeEvent(this.value());
    }
  }
}
