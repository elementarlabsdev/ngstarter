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
import { FormValueControl } from '@angular/forms/signals';
import { RadioButton } from '../radio-button/radio-button';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'ngs-radio-group',
  exportAs: 'ngsRadioGroup',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-radio-group',
    '[attr.role]': '"radiogroup"',
    '[attr.aria-disabled]': 'disabled()',
    '[class.ngs-radio-group-horizontal]': 'orientation() === "horizontal"',
    '[class.ngs-radio-group-vertical]': 'orientation() === "vertical"',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroup implements FormValueControl<any>, AfterContentInit {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  readonly _radios = contentChildren(forwardRef(() => RadioButton), { descendants: true });

  disabled = input(false, { transform: booleanAttribute });

  name = input('');
  orientation = input<RadioGroupOrientation>('horizontal');
  value = model<any>();

  readonly change = output<any>();

  constructor() {
    effect(() => {
      this._markRadiosForCheck();
    });
    effect(() => {
      this._updateSelectedRadioFromValue();
    });
  }

  ngAfterContentInit() {
    this._updateSelectedRadioFromValue();
  }

  _emitChangeEvent(value: any): void {
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
    if (this.disabled() || this.readonly() || radio.disabled()) {
      return;
    }

    if (this.value() !== radio.value()) {
      this.value.set(radio.value());
      this._emitChangeEvent(this.value());
    }
  }
}
