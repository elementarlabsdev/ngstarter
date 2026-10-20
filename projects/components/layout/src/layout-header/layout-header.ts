import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-header',
  exportAs: 'ngsLayoutHeader',
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout-header',
    '[class.as-flex]': 'flex()',
    '[class.is-auto-height]': 'autoHeight()',
  }
})
export class LayoutHeader {
  flex = input(false, { transform: booleanAttribute });
  autoHeight = input(false, { transform: booleanAttribute });
}
