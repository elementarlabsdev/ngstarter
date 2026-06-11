import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-event-title,[ngs-event-title]',
  exportAs: 'ngsEventTitle',
  templateUrl: './event-title.html',
  styleUrl: './event-title.scss',
  host: {
    'class': 'ngs-event-title',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventTitle {}
