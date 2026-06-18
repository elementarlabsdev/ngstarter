import { Component, input } from '@angular/core';

export type ToolbarTitleAppearance = 'none' | 'large';

@Component({
  selector: 'ngs-toolbar-title',
  exportAs: 'ngsToolbarTitle',
  templateUrl: './toolbar-title.html',
  styleUrl: './toolbar-title.scss',
  host: {
    'class': 'ngs-toolbar-title',
    '[class.appearance-none]': 'appearance() === "none"',
    '[class.appearance-large]': 'appearance() === "large"',
  },
})
export class ToolbarTitle {
  appearance = input<ToolbarTitleAppearance>('none');
}
