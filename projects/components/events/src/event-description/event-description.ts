import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-event-description,[ngs-event-description]',
  exportAs: 'ngsEventDescription',
  templateUrl: './event-description.html',
  styleUrl: './event-description.scss',
  host: {
    'class': 'ngs-event-description',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDescription {}
