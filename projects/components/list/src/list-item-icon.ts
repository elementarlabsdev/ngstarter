import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsListItemIcon]',
  standalone: true,
  host: {
    'class': 'ngs-list-item-icon',
  },
})
export class ListItemIcon {
  private readonly _elementRef = inject(ElementRef);
}
