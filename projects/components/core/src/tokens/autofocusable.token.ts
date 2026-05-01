import { InjectionToken } from '@angular/core';

export interface Autofocusable {
  focus(): void;
}

export const AUTOFOCUSABLE = new InjectionToken<Autofocusable>('AUTOFOCUSABLE');
