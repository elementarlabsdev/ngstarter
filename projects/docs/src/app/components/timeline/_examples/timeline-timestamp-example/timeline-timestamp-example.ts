import { Component } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import {
  TimelineAttributes, Timeline,
  TimelineDescription, TimelineHeader, TimelineItem,
  TimelineTimestamp,
  TimelineTitle
} from '@ngstarter-ui/components/timeline';

@Component({
  selector: 'app-timeline-timestamp-example',
  imports: [
    Avatar,
    TimelineTimestamp,
    TimelineTitle,
    TimelineDescription,
    TimelineAttributes,
    TimelineItem,
    TimelineHeader,
    Timeline
  ],
  templateUrl: './timeline-timestamp-example.html',
  styleUrl: './timeline-timestamp-example.scss'
})
export class TimelineTimestampExample {

}
