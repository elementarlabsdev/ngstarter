import { InjectionToken } from '@angular/core';

export const DATEPICKER_ACTION_TARGET = new InjectionToken<{ apply(): void; close(): void }>(
  'NgStarter datepicker action target',
);
