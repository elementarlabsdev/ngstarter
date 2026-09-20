import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-card-overlay',
  exportAs: 'ngsCardOverlay',
  imports: [],
  templateUrl: './card-overlay.html',
  styleUrl: './card-overlay.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-card-overlay',
    '[class.with-translate]': 'withTranslate()',
    '[class.with-blur]': 'withBlur()',
    '[class.is-disabled]': 'disabled()',
  }
})
export class CardOverlay {
  withTranslate = input(false, {
    transform: booleanAttribute
  });
  withBlur = input(false, {
    transform: booleanAttribute
  });
  disabled = input(false, {
    transform: booleanAttribute
  });
}
