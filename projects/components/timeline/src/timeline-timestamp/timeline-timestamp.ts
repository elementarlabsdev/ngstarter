import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline-timestamp',
  exportAs: 'ngsTimelineTimestamp',
  templateUrl: './timeline-timestamp.html',
  styleUrl: './timeline-timestamp.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline-timestamp'
  }
})
export class TimelineTimestamp {

}
