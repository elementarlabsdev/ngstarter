import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-menu-footer',
  exportAs: 'ngsMenuFooter',
  imports: [],
  templateUrl: './menu-footer.html',
  styleUrl: './menu-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-menu-footer',
  }
})
export class MenuFooter {

}
