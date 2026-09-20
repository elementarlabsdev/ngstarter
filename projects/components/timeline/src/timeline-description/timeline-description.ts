import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline-description',
  exportAs: 'ngsTimelineDescription',
  templateUrl: './timeline-description.html',
  styleUrl: './timeline-description.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline-description'
  }
})
export class TimelineDescription {

}
