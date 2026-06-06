import { Directive, inject, forwardRef } from '@angular/core';
import { Datepicker } from './datepicker';

@Directive({
  selector: '[ngsDatepickerApply]',
  host: {
    '(click)': '_datepicker.apply()'
  }
})
export class DatepickerApply {
  _datepicker = inject(forwardRef(() => Datepicker));
}

@Directive({
  selector: '[ngsDatepickerCancel]',
  host: {
    '(click)': '_datepicker.close()'
  }
})
export class DatepickerCancel {
  _datepicker = inject(forwardRef(() => Datepicker));
}
