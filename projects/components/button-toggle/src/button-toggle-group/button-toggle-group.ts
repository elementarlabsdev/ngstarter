import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  forwardRef,
  input,
  model,
  output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonToggle } from '../button-toggle/button-toggle';

export type ButtonToggleAppearance = 'standard' | 'legacy';

@Component({
  selector: 'ngs-button-toggle-group',
  exportAs: 'ngsButtonToggleGroup',
  templateUrl: './button-toggle-group.html',
  styleUrl: './button-toggle-group.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonToggleGroup),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-button-toggle-group',
    '[class.ngs-button-toggle-group-vertical]': 'vertical()',
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[class.only-icon]': 'onlyIcon()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class ButtonToggleGroup implements ControlValueAccessor, AfterContentInit {
  readonly _buttonToggles = contentChildren(forwardRef(() => ButtonToggle), { descendants: true });

  appearance = input<ButtonToggleAppearance>('standard');
  disabled = input(false, { transform: booleanAttribute });
  multiple = input(false, { transform: booleanAttribute });
  hideSelectionIndicator = input(false, { transform: booleanAttribute });
  vertical = input(false, { transform: booleanAttribute });
  value = model<any>(undefined);
  onlyIcon = input(false, { transform: booleanAttribute });

  readonly change = output<any>();

  _onChange: (value: any) => void = () => {};
  _onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.value();
      this._buttonToggles();
      this._updateSelectedButtonsFromValue();
    });
  }

  ngAfterContentInit() {
    this._updateSelectedButtonsFromValue();
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
    // Note: If we want to support setDisabledState with input signals,
    // we might need a separate internal signal or just accept that it won't work well with reactive inputs
    // but typically CVA's setDisabledState is for the form control to disable the component.
    // For now, let's use a private signal if we need to combine them.
  }

  _emitChangeEvent(value: any): void {
    this._onChange(value);
    this.change.emit({ source: this, value });
  }

  private _updateSelectedButtonsFromValue() {
    const _buttonToggles = this._buttonToggles();
    if (_buttonToggles) {
      _buttonToggles.forEach(toggle => {
        toggle._setChecked(this._isSelected(toggle.value()));
      });
    }
  }

  private _isSelected(val: any): boolean {
    if (this.multiple()) {
      return Array.isArray(this.value()) && this.value().includes(val);
    }
    return this.value() === val;
  }

  _onButtonClick(toggle: ButtonToggle) {
    if (this.disabled() || toggle.disabled()) {
      return;
    }

    if (this.multiple()) {
      const currentValue = Array.isArray(this.value()) ? [...this.value()] : [];
      const index = currentValue.indexOf(toggle.value());

      if (index !== -1) {
        currentValue.splice(index, 1);
      } else {
        currentValue.push(toggle.value());
      }
      this._updateValue(currentValue);
    } else {
      this._updateValue(toggle.value());
    }
  }

  private _updateValue(newValue: any) {
    this.value.set(newValue);
    this._emitChangeEvent(newValue);
  }
}
