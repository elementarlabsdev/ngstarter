import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicCalendarExample } from '../_examples/basic-calendar-example/basic-calendar-example';
import { CalendarMinMaxExample } from '../_examples/calendar-min-max-example/calendar-min-max-example';
import { CalendarWithEventsExample } from '../_examples/calendar-with-events-example/calendar-with-events-example';

@Component({
  imports: [Playground, BasicCalendarExample, CalendarWithEventsExample, CalendarMinMaxExample],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {}
