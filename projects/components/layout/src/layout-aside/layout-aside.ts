import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-aside',
  exportAs: 'ngsLayoutAside',
  templateUrl: './layout-aside.html',
  styleUrl: './layout-aside.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-layout-aside',
  }
})
export class LayoutAside {

}
