import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-toolbar-subtitle',
  exportAs: 'ngsToolbarSubtitle',
  templateUrl: './toolbar-subtitle.html',
  styleUrl: './toolbar-subtitle.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-toolbar-subtitle'
  },
})
export class ToolbarSubtitle {

}
