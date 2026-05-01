import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicTimepickerExample
} from '../_examples/basic-timepicker-example/basic-timepicker-example';
import {
  TimepickerWithDatepickerExample
} from '../_examples/timepicker-with-datepicker-example/timepicker-with-datepicker-example';
import {
  TimepickerCustomToggleIconExample
} from '../_examples/timepicker-custom-toggle-icon-example/timepicker-custom-toggle-icon-example';
import {
  TimepickerIntervalExample
} from '../_examples/timepicker-interval-example/timepicker-interval-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicTimepickerExample,
    TimepickerWithDatepickerExample,
    TimepickerCustomToggleIconExample,
    TimepickerIntervalExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
