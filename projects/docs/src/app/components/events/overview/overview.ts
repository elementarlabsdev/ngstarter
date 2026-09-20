import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicEventsExample } from '../_examples/basic-events-example/basic-events-example';
import { WeeklyEventsExample } from '../_examples/weekly-events-example/weekly-events-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicEventsExample,
    WeeklyEventsExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {}
