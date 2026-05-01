import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsListItemLine], [ngsLine]',
  standalone: true,
  host: {
    'class': 'ngs-list-item-line',
  },
})
export class ListItemLine {
  private readonly _elementRef = inject(ElementRef);
}
