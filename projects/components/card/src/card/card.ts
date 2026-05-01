import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  contentChild,
} from '@angular/core';
import { CardFooter } from '../card-footer/card-footer';
import { CARD_CONFIG, CardAppearance } from '../config';

@Component({
  selector: 'ngs-card',
  exportAs: 'ngsCard',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card not-prose',
    '[class.ngs-card-outlined]': 'appearance() === "outlined"',
    '[class.ngs-card-filled]': 'appearance() === "filled"',
    '[class.ngs-card-raised]': 'appearance() === "raised"',
  },
})
export class Card {
  private _config = inject(CARD_CONFIG, { optional: true });

  appearance = input<CardAppearance>(this._config?.appearance || 'outlined');

  readonly _footer = contentChild(CardFooter);

  get hasFooter(): boolean {
    return !!this._footer();
  }
}
