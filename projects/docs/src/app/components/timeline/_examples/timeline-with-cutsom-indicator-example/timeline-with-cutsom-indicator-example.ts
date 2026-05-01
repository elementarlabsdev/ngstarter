import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Avatar } from '@ngstarter/components/avatar';
import {
  Timeline, TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineItemIndicatorDirective,
  TimelineTimestamp, TimelineTitle
} from '@ngstarter/components/timeline';

@Component({
  selector: 'app-timeline-with-cutsom-indicator-example',
  imports: [
    Icon,
    Avatar,
    TimelineItemIndicatorDirective,
    TimelineItem,
    TimelineHeader,
    Timeline,
    TimelineTimestamp,
    TimelineDescription,
    TimelineTitle
  ],
  templateUrl: './timeline-with-cutsom-indicator-example.html',
  styleUrl: './timeline-with-cutsom-indicator-example.scss'
})
export class TimelineWithCutsomIndicatorExample {
}
