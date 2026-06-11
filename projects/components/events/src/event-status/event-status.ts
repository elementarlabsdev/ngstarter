import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventTone } from '../types';

@Component({
  selector: 'ngs-event-status,[ngs-event-status]',
  exportAs: 'ngsEventStatus',
  templateUrl: './event-status.html',
  styleUrl: './event-status.scss',
  host: {
    'class': 'ngs-event-status',
    '[class.tone-primary]': 'tone() === "primary"',
    '[class.tone-success]': 'tone() === "success"',
    '[class.tone-warning]': 'tone() === "warning"',
    '[class.tone-danger]': 'tone() === "danger"',
    '[class.tone-neutral]': 'tone() === "neutral"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatus {
  tone = input<EventTone>('default');
}
