import { Directive, inject } from '@angular/core';
import { DATEPICKER_ACTION_TARGET } from '../datepicker-action-target';

@Directive({
  selector: '[ngsDatepickerApply]',
  host: {
    '(click)': '_datepicker.apply()'
  }
})
export class DatepickerApply {
  _datepicker = inject(DATEPICKER_ACTION_TARGET);
}

@Directive({
  selector: '[ngsDatepickerCancel]',
  host: {
    '(click)': '_datepicker.close()'
  }
})
export class DatepickerCancel {
  _datepicker = inject(DATEPICKER_ACTION_TARGET);
}
