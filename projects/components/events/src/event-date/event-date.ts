import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-event-date,[ngs-event-date]',
  exportAs: 'ngsEventDate',
  templateUrl: './event-date.html',
  styleUrl: './event-date.scss',
  host: {
    'class': 'ngs-event-date',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDate {
  weekday = input('');
  day = input<string | number>('');
}
