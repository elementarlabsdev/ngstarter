import { inject, ModelSignal, OutputRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/** @docs-private Keeps Angular's native accessors from overriding a formatted input in older forms. */
export function connectLegacyNativeFormControl<T>(
  value: ModelSignal<T>,
  touch: OutputRef<void>,
  writeValue: (value: T) => void,
  setDisabledState: (disabled: boolean) => void,
): void {
  const control = inject(NgControl, { self: true, optional: true });
  // Signal Forms supplies an interop object under NgControl, without a legacy directive instance.
  if (!(control instanceof NgControl)) return;

  let writing = false;
  let change: (value: T) => void = () => {};
  let touched = () => {};
  value.subscribe(next => {
    if (!writing) change(next);
  });
  touch.subscribe(() => touched());

  control.valueAccessor = {
    writeValue(next: T) {
      writing = true;
      try {
        writeValue(next);
      } finally {
        writing = false;
      }
    },
    registerOnChange(fn: (value: T) => void) {
      change = fn;
    },
    registerOnTouched(fn: () => void) {
      touched = fn;
    },
    setDisabledState,
  };
}
