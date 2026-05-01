import { Component, input, TemplateRef, viewChild } from '@angular/core';


@Component({
  selector: 'ngs-side-panel-tab',
  exportAs: 'ngsSidePanelTab',
  standalone: true,
  templateUrl: './side-panel-tab.html',
  styleUrl: './side-panel-tab.scss',
  host: {
    'class': 'ngs-side-panel-tab',
  },
})
export class SidePanelTab {
  tabId = input.required<string>();
  label = input.required<string>();
  icon = input<string | TemplateRef<any> | undefined>();

  readonly content = viewChild.required<TemplateRef<any>>('contentTemplate');
}
