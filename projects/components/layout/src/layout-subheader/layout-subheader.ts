import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-subheader',
  exportAs: 'ngsLayoutSubheader',
  templateUrl: './layout-subheader.html',
  styleUrl: './layout-subheader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout-subheader',
    '[class.as-flex]': 'flex()',
    '[class.is-auto-height]': 'autoHeight()',
  }
})
export class LayoutSubheader {
  flex = input(false, { transform: booleanAttribute });
  autoHeight = input(false, { transform: booleanAttribute });
}
