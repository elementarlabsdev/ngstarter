import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TabPanelApiService } from '../tab-panel-api.service';

@Component({
  selector: 'ngs-tab-panel-custom-item',
  exportAs: 'ngsTabPanelCustomItem',
  templateUrl: './tab-panel-custom-item.html',
  styleUrl: './tab-panel-custom-item.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-tab-panel-custom-item',
    '(click)': '_handleClick()'
  }
})
export class TabPanelCustomItem {
  readonly api = inject(TabPanelApiService);

  for = input<any>();

  protected _handleClick() {
    if (!this.for()) {
      return;
    }

    this.api.activate(this.for());
  }
}
