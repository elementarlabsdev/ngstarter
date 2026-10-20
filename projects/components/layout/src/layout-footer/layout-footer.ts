import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-footer',
  exportAs: 'ngsLayoutFooter',
  templateUrl: './layout-footer.html',
  styleUrl: './layout-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout-footer',
    '[class.as-block]': 'block()',
    '[class.is-auto-height]': 'autoHeight()',
  }
})
export class LayoutFooter {
  block = input(false, { transform: booleanAttribute });
  autoHeight = input(false, { transform: booleanAttribute });
}
