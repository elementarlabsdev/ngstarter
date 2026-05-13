import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-panel-header',
  exportAs: 'ngsPanelHeader',
  templateUrl: './panel-header.html',
  styleUrl: './panel-header.scss',
  host: {
    'class': 'ngs-panel-header',
    '[class.is-auto-height]': 'autoHeight()',
    '[class.as-flex]': 'flex()',
  }
})
export class PanelHeader {
  flex = input(false, {
    transform: booleanAttribute
  });
  autoHeight = input(false, {
    transform: booleanAttribute
  });
}
