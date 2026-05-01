import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class TimepickerIntl {
  readonly changes = new Subject<void>();
  openTimepickerLabel = 'Open timepicker';
  closeTimepickerLabel = 'Close timepicker';
}
