import { InjectionToken, WritableSignal, Signal, ElementRef, OutputEmitterRef } from '@angular/core';

export abstract class _Select {
  abstract multiple: Signal<boolean>;
  abstract hideCheckIcon: Signal<boolean>;
  abstract _optionsContentChanges: WritableSignal<number>;
  abstract selectedCount?: Signal<number>;
  abstract triggerValue?: Signal<string>;
  abstract selectedData?: Signal<any>;
  abstract focus(): void;
}

export const SELECT = new InjectionToken<_Select>('SELECT');
