import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatepickerIntl {
  readonly changes: Subject<void> = new Subject<void>();

  calendarLabel = 'Calendar';
  openCalendarLabel = 'Open calendar';
  prevMonthLabel = 'Previous month';
  nextMonthLabel = 'Next month';
  prevYearLabel = 'Previous year';
  nextYearLabel = 'Next year';
  prevMultiYearLabel = 'Previous 24 years';
  nextMultiYearLabel = 'Next 24 years';
  switchToMonthViewLabel = 'Choose date';
  switchToMultiYearViewLabel = 'Choose month and year';
}
