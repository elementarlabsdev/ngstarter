import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-menu-header',
  exportAs: 'ngsMenuHeader',
  imports: [],
  templateUrl: './menu-header.html',
  styleUrl: './menu-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-menu-header',
  }
})
export class MenuHeader {

}
