import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-layout-footer',
  exportAs: 'ngsLayoutFooter',
  templateUrl: './layout-footer.html',
  styleUrl: './layout-footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-layout-footer',
  }
})
export class LayoutFooter {

}
