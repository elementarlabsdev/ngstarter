import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export type ToolbarTitleAppearance = 'none' | 'large';

@Component({
  selector: 'ngs-toolbar-title',
  exportAs: 'ngsToolbarTitle',
  templateUrl: './toolbar-title.html',
  styleUrl: './toolbar-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-toolbar-title',
    '[class.appearance-none]': 'appearance() === "none"',
    '[class.appearance-large]': 'appearance() === "large"',
  },
})
export class ToolbarTitle {
  appearance = input<ToolbarTitleAppearance>('none');
}
