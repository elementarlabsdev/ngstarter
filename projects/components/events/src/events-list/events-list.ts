import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventsListGroupBy } from '../types';

@Component({
  selector: 'ngs-events-list',
  exportAs: 'ngsEventsList',
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
  host: {
    'class': 'ngs-events-list',
    '[class.ngs-events-list-grouped-by-day]': 'groupBy() === "day"',
    '[class.ngs-events-list-grouped-by-week]': 'groupBy() === "week"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsList {
  groupBy = input<EventsListGroupBy>('day');
}
