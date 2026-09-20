import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline-header',
  exportAs: 'ngsTimelineHeader',
  templateUrl: './timeline-header.html',
  styleUrl: './timeline-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline-header'
  }
})
export class TimelineHeader {

}
