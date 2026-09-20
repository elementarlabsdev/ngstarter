import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-panel-aside',
  imports: [],
  templateUrl: './panel-aside.html',
  styleUrl: './panel-aside.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-panel-aside'
  }
})
export class PanelAside {

}
