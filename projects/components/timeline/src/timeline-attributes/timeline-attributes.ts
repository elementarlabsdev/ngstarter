import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline-attributes',
  exportAs: 'ngsTimelineAttributes',
  templateUrl: './timeline-attributes.html',
  styleUrl: './timeline-attributes.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline-attributes'
  }
})
export class TimelineAttributes {

}
