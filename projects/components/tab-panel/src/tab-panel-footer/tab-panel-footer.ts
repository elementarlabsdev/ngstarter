import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-tab-panel-footer',
  exportAs: 'ngsTabPanelFooter',
  templateUrl: './tab-panel-footer.html',
  styleUrl: './tab-panel-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-tab-panel-footer'
  }
})
export class TabPanelFooter {
}
