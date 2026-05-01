import { Component } from '@angular/core';
import { Avatar } from '@ngstarter/components/avatar';
import {
  TimelineAttributes, Timeline,
  TimelineDescription, TimelineHeader, TimelineItem,
  TimelineTimestamp,
  TimelineTitle
} from '@ngstarter/components/timeline';

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
