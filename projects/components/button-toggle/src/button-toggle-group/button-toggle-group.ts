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
import { FormValueControl } from '@angular/forms/signals';
import { ButtonToggle } from '../button-toggle/button-toggle';

export type ButtonToggleAppearance = 'standard' | 'legacy';

@Component({
  selector: 'ngs-button-toggle-group',
  exportAs: 'ngsButtonToggleGroup',
  templateUrl: './button-toggle-group.html',
  styleUrl: './button-toggle-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-button-toggle-group',
    '[class.ngs-button-toggle-group-vertical]': 'vertical()',
    '[attr.role]': 'multiple() ? "group" : "radiogroup"',
    '[class.only-icon]': 'onlyIcon()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class ButtonToggleGroup implements FormValueControl<any>, AfterContentInit {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  readonly _buttonToggles = contentChildren(forwardRef(() => ButtonToggle), { descendants: true });

  appearance = input<ButtonToggleAppearance>('standard');
  disabled = input(false, { transform: booleanAttribute });
  multiple = input(false, { transform: booleanAttribute });
  hideSelectionIndicator = input(false, { transform: booleanAttribute });
  vertical = input(false, { transform: booleanAttribute });
  value = model<any>(undefined);
  onlyIcon = input(false, { transform: booleanAttribute });

  readonly change = output<any>();

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

  _emitChangeEvent(value: any): void {
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
    if (this.disabled() || this.readonly() || toggle.disabled()) {
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
