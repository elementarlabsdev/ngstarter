import { InjectionToken, Signal, ElementRef, OutputEmitterRef, WritableSignal } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';

export abstract class _Option implements Highlightable {
  abstract id: string;
  abstract setActiveStyles(): void;
  abstract setInactiveStyles(): void;
  abstract getLabel(): string;
  abstract value: Signal<any>;
  abstract data?: Signal<any>;
  abstract elementRef: ElementRef<HTMLElement>;
  abstract select(): void;
  abstract deselect(): void;
  abstract selected: boolean;
  abstract viewValue: string;
  abstract onSelectionChange: OutputEmitterRef<_Option>;
  abstract disabled: boolean;
}

export abstract class _OptionParent {
  abstract multiple: Signal<boolean>;
  abstract hideCheckIcon?: Signal<boolean>;
  abstract _optionsContentChanges?: WritableSignal<number>;
}

export const OPTION_PARENT = new InjectionToken<_OptionParent>('OPTION_PARENT');
export const OPTION = new InjectionToken<_Option>('OPTION');
