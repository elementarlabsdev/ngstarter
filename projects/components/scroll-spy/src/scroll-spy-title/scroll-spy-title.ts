import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-scroll-spy-title,[ngs-scroll-spy-title]',
  exportAs: 'ngsScrollSpyTitle',
  templateUrl: './scroll-spy-title.html',
  styleUrl: './scroll-spy-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-scroll-spy-title'
  }
})
export class ScrollSpyTitle {

}
