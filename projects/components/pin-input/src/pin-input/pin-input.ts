import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { PinInputDirective } from '../pin-input.directive';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'ngs-pin-input',
  exportAs: 'ngsPinInput',
  imports: [FormField, Input, PinInputDirective],
  templateUrl: './pin-input.html',
  styleUrl: './pin-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-pin-input',
    '[class.is-disabled]': 'disabled()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class PinInput implements FormValueControl<number | string | null> {
  readonly inputs = viewChildren(PinInputDirective);
  readonly length = input(4, { transform: numberAttribute });
  readonly placeholder = input('');
  readonly acceptOnly = input(/^[0-9]+$/);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly value = model<number | string | null>(null);
  readonly touch = output<void>();

  protected readonly digits = linkedSignal({
    source: () => ({ value: this.value(), length: this.length() }),
    computation: ({ value, length }) =>
      Array.from({ length }, (_, index) => String(value ?? '')[index] ?? ''),
  });

  protected onInput(input: HTMLInputElement, index: number): void {
    if (this.disabled() || this.readonly()) return;
    const character = input.value;
    if (character && !this.acceptOnly().test(character)) {
      input.value = this.digits()[index];
      return;
    }
    this.updateDigits(index, character);
    if (character) this.inputs()[index + 1]?.api.focus();
  }

  protected onBackspace(input: HTMLInputElement, index: number): void {
    if (!input.value && !this.disabled() && !this.readonly() && index > 0) {
      this.inputs()[index - 1]?.api.focus();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  focus(): void {
    this.inputs()[0]?.api.focus();
  }

  private updateDigits(index: number, character: string): void {
    const digits = [...this.digits()];
    digits[index] = character;
    const text = digits.join('');
    this.value.set(text ? Number(text) : null);
    this.digits.set(digits);
  }
}
