import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  OnInit,
  booleanAttribute,
  output,
  model,
  contentChildren,
  effect
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '@ngstarter/components/icon';

let nextId = 0;

export type ButtonToggleAppearance = 'standard' | 'legacy';

@Component({
  selector: 'ngs-button-toggle-group',
  exportAs: 'ngsButtonToggleGroup',
  templateUrl: '../button-toggle-group/button-toggle-group.html',
  styleUrl: '../button-toggle-group/button-toggle-group.scss',
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

@Component({
  selector: 'ngs-button-toggle',
  templateUrl: './button-toggle.html',
  styleUrl: './button-toggle.scss',
  host: {
    '[class.ngs-button-toggle-checked]': 'isChecked',
    '[class.ngs-button-toggle-disabled]': 'isDisabled',
    '[attr.id]': 'id()',
    'class': 'ngs-button-toggle',
  },
  standalone: true,
  imports: [
    Icon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggle implements OnInit {
  private _id = `ngs-button-toggle-${nextId++}`;

  id = input<string>(`ngs-button-toggle-${nextId++}`);
  value = input<any>(undefined);
  name = input<string | undefined>(undefined);
  checked = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  private _internalChecked = false;
  get isChecked(): boolean {
    return this.checked() || this._internalChecked;
  }
  _setChecked(value: boolean) {
    this._internalChecked = value;
    this._changeDetectorRef.markForCheck();
  }

  readonly change = output<any>();

  public buttonToggleGroup = inject(forwardRef(() => ButtonToggleGroup), { optional: true });
  private _changeDetectorRef = inject(ChangeDetectorRef);

  get isDisabled(): boolean {
    return this.disabled() || (this.buttonToggleGroup && this.buttonToggleGroup.disabled());
  }

  get _shouldShowSelectionIndicator(): boolean {
    if (!this.isChecked) {
      return false;
    }

    if (!this.buttonToggleGroup) {
      return false;
    }

    return !this.buttonToggleGroup.hideSelectionIndicator();
  }

  ngOnInit() {
    if (this.buttonToggleGroup && this.buttonToggleGroup.value() === this.value()) {
      this._setChecked(true);
    }
  }

  _onButtonClick() {
    if (this.buttonToggleGroup) {
      this.buttonToggleGroup._onButtonClick(this);
    } else {
      this._setChecked(!this.isChecked);
      this.change.emit({ source: this, value: this.value() });
    }
  }

  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }
}
