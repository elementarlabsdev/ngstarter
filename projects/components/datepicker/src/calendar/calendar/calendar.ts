import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  Type,
  effect,
} from '@angular/core';
import { DateAdapter } from '../../core/datetime/date-adapter';
import { DatepickerIntl } from '../../datepicker-intl';
import { MonthView } from '../month-view/month-view';
import { DateRange } from '../../core/datetime/date-range';
import { YearView } from '../year-view/year-view';
import { MultiYearView } from '../multi-year-view/multi-year-view';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'ngs-calendar',
  standalone: true,
  imports: [MonthView, YearView, MultiYearView, Button, Icon, NgComponentOutlet],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'ngsCalendar',
  host: {
    'class': 'ngs-calendar',
  },
})
export class Calendar<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private _intl = inject(DatepickerIntl);

  readonly startAt = input<D | null>(null);
  readonly selected = input<D | DateRange<D> | null>(null);
  readonly minDate = input<D | null>(null);
  readonly maxDate = input<D | null>(null);
  readonly headerComponent = input<Type<any> | null>(null);

  readonly selectedChange = output<D>();
  readonly yearSelected = output<D>();
  readonly monthSelected = output<D>();

  activeDate = signal<D>(this.startAt() || this._dateAdapter.today());

  constructor() {
    effect(() => {
      const selected = this.selected();
      if (selected instanceof DateRange) {
        if (selected.start) {
          this.activeDate.set(selected.start);
        }
      } else if (selected) {
        this.activeDate.set(selected as D);
      }
    });
    effect(() => {
      const startAt = this.startAt();

      if (startAt) {
        this.activeDate.set(startAt);
      }
    });
  }
  currentView = signal<'month' | 'year' | 'multi-year'>('month');

  readonly _selectedDate = computed(() => {
    const selected = this.selected();

    if (selected instanceof DateRange) {
      return selected.start;
    }

    return selected;
  });

  readonly periodButtonText = computed(() => {
    const activeDate = this.activeDate();

    if (!activeDate || !this._dateAdapter.isValid(activeDate)) {
      return '';
    }

    if (this.currentView() === 'month') {
      return this._dateAdapter.format(activeDate, { month: 'long', year: 'numeric' });
    }
    if (this.currentView() === 'year') {
      return this._dateAdapter.getYearName(activeDate);
    }
    if (this.currentView() === 'multi-year') {
      const currentYear = this._dateAdapter.getYear(activeDate);
      const startYear = Math.floor(currentYear / 24) * 24;
      const endYear = startYear + 23;
      const startDate = this._dateAdapter.createDate(startYear, 0, 1);
      const endDate = this._dateAdapter.createDate(endYear, 0, 1);
      return `${this._dateAdapter.getYearName(startDate)} - ${this._dateAdapter.getYearName(endDate)}`;
    }
    return '';
  });

  prevPage() {
    this.activeDate.update(date => {
      if (this.currentView() === 'month') {
        return this._dateAdapter.addCalendarMonths(date, -1);
      }
      if (this.currentView() === 'year') {
        return this._dateAdapter.addCalendarYears(date, -1);
      }
      if (this.currentView() === 'multi-year') {
        return this._dateAdapter.addCalendarYears(date, -24);
      }
      return date;
    });
  }

  nextPage() {
    this.activeDate.update(date => {
      if (this.currentView() === 'month') {
        return this._dateAdapter.addCalendarMonths(date, 1);
      }
      if (this.currentView() === 'year') {
        return this._dateAdapter.addCalendarYears(date, 1);
      }
      if (this.currentView() === 'multi-year') {
        return this._dateAdapter.addCalendarYears(date, 24);
      }
      return date;
    });
  }

  toggleView() {
    this.currentView.update(view => {
      if (view === 'month') {
        return 'multi-year';
      }
      if (view === 'year') {
        return 'multi-year';
      }
      return 'month';
    });
  }

  _monthSelectedInYearView(date: D) {
    this.activeDate.set(date);
    this.currentView.set('month');
    this.monthSelected.emit(date);
  }

  _yearSelectedInMultiYearView(date: D) {
    this.activeDate.set(date);
    this.currentView.set('year');
    this.yearSelected.emit(date);
  }
}
