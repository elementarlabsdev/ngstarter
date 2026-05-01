import { Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from './date-adapter';
import { NativeDateAdapter } from './native-date-adapter';

export const MAT_NATIVE_DATE_FORMATS = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { month: 'long', year: 'numeric', day: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  }
};

export function provideNativeDateAdapter(): Provider[] {
  return [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ];
}
