import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-panel-footer',
  exportAs: 'ngsPanelFooter',
  templateUrl: './panel-footer.html',
  styleUrl: './panel-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-panel-footer',
    '[class.is-auto-height]': 'autoHeight()',
    '[class.as-block]': 'block()',
  }
})
export class PanelFooter {
  block = input(false, {
    transform: booleanAttribute
  });
  autoHeight = input(false, {
    transform: booleanAttribute
  });
}
