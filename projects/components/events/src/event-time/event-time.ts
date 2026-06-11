import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-event-time,[ngs-event-time]',
  exportAs: 'ngsEventTime',
  templateUrl: './event-time.html',
  styleUrl: './event-time.scss',
  host: {
    'class': 'ngs-event-time',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventTime {}
