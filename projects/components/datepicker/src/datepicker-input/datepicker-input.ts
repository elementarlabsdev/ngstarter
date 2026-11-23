import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormField as SignalFormField, FormValueControl, transformedValue } from '@angular/forms/signals';
import { connectLegacyNativeFormControl } from '@ngstarter-ui/components/core';
import { FormField } from '@ngstarter-ui/components/form-field';
import { DateAdapter } from '../core/datetime/date-adapter';
import type { Datepicker } from '../datepicker/datepicker';

@Directive({
  selector: 'input[ngsDatepicker]',
  exportAs: 'ngsDatepickerInput',
  host: {
    'class': 'ngs-datepicker-input',
    '[value]': 'rawValue()',
    '[disabled]': 'isDisabled()',
    '[readOnly]': 'readonly()',
    '(input)': 'onInput($any($event.target).value)',
    '(blur)': 'touch.emit()',
  },
})
export class DatepickerInput<D> implements FormValueControl<D | null> {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly formField = inject(FormField, { optional: true });
  private readonly signalField = inject(SignalFormField, { self: true, optional: true });
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private readonly legacyDisabled = signal(false);

  readonly ngsDatepicker = input.required<Datepicker<D>>();
  readonly value = model<D | null>(null);
  readonly touch = output<void>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  protected readonly rawValue = transformedValue(this.value, {
    parse: (raw: string) => {
      if (!raw.trim()) return { value: null };
      const date = this.dateAdapter.parse(raw, null);
      return date && this.dateAdapter.isValid(date)
        ? { value: date }
        : { value: null, error: { kind: 'parse', message: 'Enter a valid date.' } };
    },
    format: date => date && this.dateAdapter.isDateInstance(date) && this.dateAdapter.isValid(date)
      ? this.dateAdapter.format(date, { year: 'numeric', month: '2-digit', day: '2-digit' })
      : '',
  });

  constructor() {
    connectLegacyNativeFormControl(this.value, this.touch, value => this.value.set(value), this.legacyDisabled.set);
    effect(onCleanup => {
      const picker = this.ngsDatepicker();
      picker._registerInput(this);
      onCleanup(() => picker._unregisterInput(this));
    });
  }

  protected onInput(raw: string): void {
    if (!this.isDisabled() && !this.readonly()) this.rawValue.set(raw);
  }

  isDisabled(): boolean {
    return this.disabled() || this.legacyDisabled();
  }

  canSelectDate(): boolean {
    return !this.isDisabled() && !(this.signalField && this.readonly());
  }

  selectDate(date: D): void {
    if (!this.canSelectDate()) return;
    this.value.set(date);
    this.elementRef.nativeElement.value = this.rawValue();
  }

  getConnectedOverlayOrigin(): ElementRef {
    return this.formField?.container() ?? this.elementRef;
  }
}
