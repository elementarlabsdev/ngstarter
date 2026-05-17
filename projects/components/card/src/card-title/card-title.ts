import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-card-title, [ngs-card-title], [ngsCardTitle]',
  exportAs: 'ngsCardTitle',
  templateUrl: './card-title.html',
  styleUrl: './card-title.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-title'
  }
})
export class CardTitle {}
