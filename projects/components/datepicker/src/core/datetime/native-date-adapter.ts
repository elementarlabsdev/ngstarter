import { Injectable } from '@angular/core';
import { DateAdapter } from './date-adapter';

@Injectable()
export class NativeDateAdapter extends DateAdapter<Date> {
  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, { month: style, timeZone: 'UTC' });
    return Array.from({ length: 12 }, (_, i) => this._stripDirectionMarkers(dtf.format(new Date(Date.UTC(2017, i, 1)))));
  }

  getDateNames(): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, { day: 'numeric', timeZone: 'UTC' });
    return Array.from({ length: 31 }, (_, i) => this._stripDirectionMarkers(dtf.format(new Date(Date.UTC(2017, 0, i + 1)))));
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const dtf = new Intl.DateTimeFormat(this.locale, { weekday: style, timeZone: 'UTC' });
    return Array.from({ length: 7 }, (_, i) => this._stripDirectionMarkers(dtf.format(new Date(Date.UTC(2017, 0, i + 8)))));
  }

  getYearName(date: Date): string {
    const dtf = new Intl.DateTimeFormat(this.locale, { year: 'numeric', timeZone: 'UTC' });
    return this._stripDirectionMarkers(dtf.format(new Date(Date.UTC(date.getFullYear(), 0, 1))));
  }

  getFirstDayOfWeek(): number {
    return 0; // Sunday
  }

  getNumDaysInMonth(date: Date): number {
    return this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0).getDate();
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index must be between 0 and 11.`);
    }
    if (date < 1) {
      throw Error(`Invalid date "${date}". Date must be greater than 0.`);
    }
    const result = this._createDateWithOverflow(year, month, date);
    if (result.getMonth() !== month) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }
    return result;
  }

  today(): Date {
    return new Date();
  }

  parse(value: any): Date | null {
    if (typeof value === 'number') {
      return new Date(value);
    }

    if (value && typeof value === 'string') {
      const parts = value.split('/');

      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          return this.createDate(year, month, day);
        }
      }

      return new Date(Date.parse(value));
    }

    return value ? new Date(Date.parse(value)) : null;
  }

  format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('NativeDateAdapter: Cannot format invalid date.');
    }
    const dtf = new Intl.DateTimeFormat(this.locale, { ...displayFormat, timeZone: 'UTC' });
    return this._stripDirectionMarkers(dtf.format(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))));
  }

  addCalendarYears(date: Date, years: number): Date {
    return this.addCalendarMonths(date, years * 12);
  }

  addCalendarMonths(date: Date, months: number): Date {
    let newDate = this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + months, this.getDate(date));
    if (this.getMonth(newDate) !== (this.getMonth(date) + months) % 12) {
      newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
    }
    return newDate;
  }

  addCalendarDays(date: Date, days: number): Date {
    return this._createDateWithOverflow(this.getYear(date), this.getMonth(date), this.getDate(date) + days);
  }

  toIso8601(date: Date): string {
    return [date.getUTCFullYear(), this._2digit(date.getUTCMonth() + 1), this._2digit(date.getUTCDate())].join('-');
  }

  isDateInstance(obj: any): obj is Date {
    return obj instanceof Date;
  }

  isValid(date: Date): boolean {
    return this.isDateInstance(date) && !isNaN(date.getTime());
  }

  invalid(): Date {
    return new Date(NaN);
  }

  private _2digit(n: number) {
    return ('00' + n).slice(-2);
  }

  private _stripDirectionMarkers(str: string): string {
    return str.replace(/[\u200e\u200f]/g, '');
  }

  private _createDateWithOverflow(year: number, month: number, date: number): Date {
    const result = new Date(year, month, date);
    if (year >= 0 && year < 100) {
      result.setFullYear(year);
    }
    return result;
  }
}
