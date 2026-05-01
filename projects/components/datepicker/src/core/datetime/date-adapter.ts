import { Signal, computed, inject, InjectionToken, LOCALE_ID } from '@angular/core';
import { Subject } from 'rxjs';

/** Injection token for the DateAdapter's locale. */
export const MAT_DATE_LOCALE = new InjectionToken<string>('MAT_DATE_LOCALE');

/** Injection token for the DateAdapter's formats. */
export const MAT_DATE_FORMATS = new InjectionToken<any>('MAT_DATE_FORMATS');

export abstract class DateAdapter<D> {
  protected _localeChanges = new Subject<void>();
  readonly localeChanges: Subject<void> = this._localeChanges;

  abstract getYear(date: D): number;
  abstract getMonth(date: D): number;
  abstract getDate(date: D): number;
  abstract getDayOfWeek(date: D): number;
  abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
  abstract getDateNames(): string[];
  abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
  abstract getYearName(date: D): string;
  abstract getFirstDayOfWeek(): number;
  abstract getNumDaysInMonth(date: D): number;
  abstract clone(date: D): D;
  abstract createDate(year: number, month: number, date: number): D;
  abstract today(): D;
  abstract parse(value: any, parseFormat: any): D | null;
  abstract format(date: D, displayFormat: any): string;
  abstract addCalendarYears(date: D, years: number): D;
  abstract addCalendarMonths(date: D, months: number): D;
  abstract addCalendarDays(date: D, days: number): D;
  abstract toIso8601(date: D): string;
  abstract isDateInstance(obj: any): obj is D;
  abstract isValid(date: D): boolean;
  abstract invalid(): D;

  setLocale(locale: string) {
    this.locale = locale;
    this._localeChanges.next();
  }

  protected locale: string = inject(LOCALE_ID);

  compareDate(first: D, second: D): number {
    return (
      this.getYear(first) - this.getYear(second) ||
      this.getMonth(first) - this.getMonth(second) ||
      this.getDate(first) - this.getDate(second)
    );
  }

  sameDate(first: D | null, second: D | null): boolean {
    if (first && second) {
      let firstValid = this.isValid(first);
      let secondValid = this.isValid(second);
      if (firstValid && secondValid) {
        return !this.compareDate(first, second);
      }
      return firstValid === secondValid;
    }
    return first === second;
  }

  clampDate(date: D, min?: D | null, max?: D | null): D {
    if (min && this.compareDate(date, min) < 0) {
      return min;
    }
    if (max && this.compareDate(date, max) > 0) {
      return max;
    }
    return date;
  }
}
