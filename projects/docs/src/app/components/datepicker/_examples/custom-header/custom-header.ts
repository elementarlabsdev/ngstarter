import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Subject } from 'rxjs';
import { Button } from '@ngstarter-ui/components/button';
import { Calendar, DateAdapter } from '@ngstarter-ui/components/datepicker';

@Component({
  selector: 'app-custom-header',
  imports: [
    Icon,
    Button
  ],
  templateUrl: './custom-header.html',
  styleUrl: './custom-header.scss'
})
export class CustomHeader<D> implements OnDestroy {
  private _destroyed = new Subject<void>();
  private _calendar = inject<Calendar<D>>(Calendar);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  constructor() {
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(this._calendar.activeDate(), { month: 'short', year: 'numeric' })
      .toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate.update(activeDate => {
      return mode === 'month'
        ? this._dateAdapter.addCalendarMonths(activeDate, -1)
        : this._dateAdapter.addCalendarYears(activeDate, -1);
    });
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate.update(activeDate => {
      return mode === 'month'
        ? this._dateAdapter.addCalendarMonths(activeDate, 1)
        : this._dateAdapter.addCalendarYears(activeDate, 1);
    });
  }
}
