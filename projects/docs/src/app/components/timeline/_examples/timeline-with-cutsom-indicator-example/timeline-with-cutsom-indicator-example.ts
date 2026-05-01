import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Avatar } from '@ngstarter-ui/components/avatar';
import {
  Timeline, TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineItemIndicatorDirective,
  TimelineTimestamp, TimelineTitle
} from '@ngstarter-ui/components/timeline';

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
