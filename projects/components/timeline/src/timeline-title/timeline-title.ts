import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline-title',
  exportAs: 'ngsTimelineTitle',
  templateUrl: './timeline-title.html',
  styleUrl: './timeline-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline-title'
  }
})
export class TimelineTitle {

}
