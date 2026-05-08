import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTimelineExample } from '../_examples/basic-timeline-example/basic-timeline-example';
import {
  TimelineTimestampExample
} from '../_examples/timeline-timestamp-example/timeline-timestamp-example';
import {
  TimelineWithCutsomIndicatorExample
} from '../_examples/timeline-with-cutsom-indicator-example/timeline-with-cutsom-indicator-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTimelineExample,
    TimelineTimestampExample,
    TimelineWithCutsomIndicatorExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
