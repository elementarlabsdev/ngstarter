import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsListItemTitle]',
  standalone: true,
  host: {
    'class': 'ngs-list-item-title',
  },
})
export class ListItemTitle {
  private readonly _elementRef = inject(ElementRef);
}
