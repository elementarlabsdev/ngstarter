import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-header',
  exportAs: 'ngsLayoutHeader',
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-layout-header',
  }
})
export class LayoutHeader {

}
