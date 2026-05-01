import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-card-subtitle, [ngs-card-subtitle], [ngsCardSubtitle]',
  exportAs: 'ngsCardSubtitle',
  standalone: true,
  templateUrl: './card-subtitle.html',
  styleUrl: './card-subtitle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-subtitle'
  }
})
export class CardSubtitle {}
