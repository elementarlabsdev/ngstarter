import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardActionsPosition = 'start' | 'center' | 'end' | 'between';

@Component({
  selector: 'ngs-card-actions, [ngs-card-actions], [ngsCardActions]',
  standalone: true,
  templateUrl: './card-actions.html',
  styleUrl: './card-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-actions',
    '[class.ngs-card-actions-align-end]': 'align() === "end"',
    '[class.ngs-card-actions-align-center]': 'align() === "center"',
    '[class.ngs-card-actions-align-between]': 'align() === "between"',
  }
})
export class CardActions {
  align = input<CardActionsPosition>('start');
}
