import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-panel-sidebar',
  imports: [],
  templateUrl: './panel-sidebar.html',
  styleUrl: './panel-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-panel-sidebar'
  }
})
export class PanelSidebar {

}
