import { Component } from '@angular/core';
import { Avatar } from '@ngstarter/components/avatar';
import {
  TimelineAttributes, Timeline,
  TimelineDescription, TimelineHeader, TimelineItem,
  TimelineTitle
} from '@ngstarter/components/timeline';

@Component({
  selector: 'app-basic-timeline-example',
  imports: [
    Avatar,
    TimelineDescription,
    TimelineAttributes,
    TimelineTitle,
    TimelineItem,
    TimelineHeader,
    Timeline
  ],
  templateUrl: './basic-timeline-example.html',
  styleUrl: './basic-timeline-example.scss'
})
export class BasicTimelineExample {
}
