import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-event',
  exportAs: 'ngsEvent',
  templateUrl: './event.html',
  styleUrl: './event.scss',
  host: {
    'class': 'ngs-event',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Event {}
