import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-panel-header',
  exportAs: 'ngsPanelHeader',
  templateUrl: './panel-header.html',
  styleUrl: './panel-header.scss',
  host: {
    'class': 'ngs-panel-header',
    '[class.is-auto-height]': 'autoHeight()'
  }
})
export class PanelHeader {
  autoHeight = input(false, {
    transform: booleanAttribute
  });
}
