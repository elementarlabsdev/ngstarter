import { DestroyRef, Directive, ElementRef, inject, input, model, numberAttribute, output } from '@angular/core';
import { connectLegacyNativeFormControl } from '../forms/native-form-control';

/** Debounces template-driven text fields. Use the debounce schema rule with Signal Forms. */
@Directive({
  selector: 'input[ngsDebounceTime][ngModel], textarea[ngsDebounceTime][ngModel]',
  host: {
    '(input)': 'handleInput()',
    '(blur)': 'touch.emit()'
  }
})
export class DebounceTimeDirective {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  readonly debounceTime = input(300, { transform: numberAttribute });
  readonly value = model<string | null>(null);
  readonly touch = output<void>();

  constructor() {
    connectLegacyNativeFormControl(this.value, this.touch, value => {
      clearTimeout(this.debounceTimer);
      this.element.value = value ?? '';
      this.value.set(value);
    }, disabled => {
      this.element.disabled = disabled;
      if (disabled) clearTimeout(this.debounceTimer);
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.debounceTimer));
  }

  protected handleInput(): void {
    clearTimeout(this.debounceTimer);
    const value = this.element.value;
    const delay = this.debounceTime();
    if (delay) {
      this.debounceTimer = setTimeout(() => this.value.set(value), delay);
    } else {
      this.value.set(value);
    }
  }
}
