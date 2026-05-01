import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-card-header',
  standalone: true,
  imports: [
  ],
  templateUrl: './card-header.html',
  styleUrl: './card-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-header'
  }
})
export class CardHeader {}
