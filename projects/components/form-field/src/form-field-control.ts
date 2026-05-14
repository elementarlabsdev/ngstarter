import { Injectable } from '@angular/core';

@Injectable()
export abstract class FormFieldControl<T> {
  abstract value: T | null;
  abstract readonly stateChanges: any;
  abstract readonly id: string;
  abstract readonly placeholder: string | undefined;
  abstract readonly ngControl: any;
  abstract readonly focused: boolean;
  abstract readonly empty: boolean;
  abstract readonly shouldLabelFloat: boolean;
  abstract readonly required: boolean;
  abstract readonly disabled: boolean;
  abstract readonly errorState: boolean;
  readonly multiline?: boolean;
  abstract focus(): void;
}
