import {booleanAttribute, Component, input} from '@angular/core';

@Component({
  selector: 'ngs-panel-subheader',
  exportAs: 'ngsPanelSubheader',
  imports: [],
  templateUrl: './panel-subheader.html',
  styleUrl: './panel-subheader.scss',
  host: {
    'class': 'ngs-panel-subheader',
    '[class.is-auto-height]': 'autoHeight()',
    '[class.as-flex]': 'flex()',
  }
})
export class PanelSubheader {
  flex = input(false, {
    transform: booleanAttribute
  });
  autoHeight = input(false, {
    transform: booleanAttribute
  });
}
