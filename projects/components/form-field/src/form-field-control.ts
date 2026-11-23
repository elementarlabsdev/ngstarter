import { Injectable, Signal } from '@angular/core';

@Injectable()
export abstract class FormFieldControl<T> {
  abstract readonly value: T | Signal<T | null> | null;
  abstract readonly stateChanges: any;
  abstract readonly id: string;
  abstract readonly placeholder: string | undefined;
  abstract readonly ngControl: any;
  abstract readonly focused: boolean;
  abstract readonly empty: boolean;
  abstract readonly shouldLabelFloat: boolean;
  abstract readonly required: boolean | Signal<boolean>;
  abstract readonly disabled: boolean | Signal<boolean>;
  abstract readonly errorState: boolean;
  readonly multiline?: boolean;
  onContainerClick?(event: MouseEvent): void;
  abstract focus(): void;
}
