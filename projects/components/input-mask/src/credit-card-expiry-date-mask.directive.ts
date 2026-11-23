import { Directive, ElementRef, inject, input, model, output } from '@angular/core';
import { FormValueControl, transformedValue } from '@angular/forms/signals';
import { connectLegacyNativeFormControl } from '@ngstarter-ui/components/core';

const formatOnInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').substring(0, 4);
  let month = cleaned.substring(0, 2);
  const year = cleaned.substring(2, 4);

  if (month.length === 2) {
    const monthInt = parseInt(month, 10);
    if (monthInt > 12) month = '12';
    if (monthInt === 0) month = '01';
  }

  return cleaned.length > 2 ? `${month}/${year}` : month;
};

const formatOnBlur = (value: string): string => {
  if (!value) return '';
  const parts = value.split('/');
  const month = parts[0] || '';
  let year = parts[1] || '';

  if (year && year.length === 1) {
    year = `0${year}`;
  }

  return year ? `${month}/${year}` : month;
};


@Directive({
  selector: 'input[ngsCreditCardExpiryDateMask]',
  exportAs: 'ngsCreditCardExpiryDateMask',
  host: {
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur($event)',
    '[attr.placeholder]': 'placeholder()',
    '[value]': 'rawValue()',
  }
})
export class CreditCardExpiryDateMaskDirective implements FormValueControl<string | null> {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly placeholder = input('MM/YY');

  readonly value = model<string | null>(null);
  readonly touch = output<void>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (raw: string) => ({ value: raw.replace(/\D/g, '') }),
    format: value => formatOnInput(value ?? ''),
  });

  constructor() {
    connectLegacyNativeFormControl(this.value, this.touch, value => this.value.set(value),
      disabled => { this.elementRef.nativeElement.disabled = disabled; });
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const selectionStart = target.selectionStart;
    const previousValue = target.value;
    const formattedValue = formatOnInput(target.value);

    this.rawValue.set(formattedValue);
    target.value = formattedValue;

    if (selectionStart !== null) {
      const newCursorPosition = selectionStart + (formattedValue.length - previousValue.length);
      target.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  }

  onBlur(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const formattedValue = formatOnBlur(target.value);
    this.rawValue.set(formattedValue);
    this.touch.emit();
    target.value = formattedValue;
  }
}
