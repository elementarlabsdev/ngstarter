import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-card-content, [ngs-card-content], [ngsCardContent]',
  exportAs: 'ngsCardContent',
  standalone: true,
  templateUrl: './card-content.html',
  styleUrls: ['./card-content.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-content',
    '[class.without-padding]': 'withoutPadding()',
  }
})
export class CardContent {
  withoutPadding = input(false, {
    transform: booleanAttribute
  })
}
