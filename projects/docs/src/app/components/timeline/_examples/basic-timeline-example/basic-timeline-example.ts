import { Component } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import {
  TimelineAttributes, Timeline,
  TimelineDescription, TimelineHeader, TimelineItem,
  TimelineTitle
} from '@ngstarter-ui/components/timeline';

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
