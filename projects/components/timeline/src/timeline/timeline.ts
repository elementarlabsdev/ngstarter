import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-timeline',
  exportAs: 'ngsTimeline',
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-timeline'
  }
})
export class Timeline {

}
