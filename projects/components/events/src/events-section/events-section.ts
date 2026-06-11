import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-events-section',
  exportAs: 'ngsEventsSection',
  templateUrl: './events-section.html',
  styleUrl: './events-section.scss',
  host: {
    'class': 'ngs-events-section',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsSection {
  label = input('');
}
