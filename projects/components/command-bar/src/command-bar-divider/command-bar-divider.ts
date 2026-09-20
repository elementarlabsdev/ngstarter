import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-command-bar-divider',
  exportAs: 'ngsCommandBarDivider',
  templateUrl: './command-bar-divider.html',
  styleUrl: './command-bar-divider.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-command-bar-divider'
  }
})
export class CommandBarDivider {
}
